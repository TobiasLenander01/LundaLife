from dotenv import load_dotenv
from bs4 import BeautifulSoup
import os
import psycopg2
import datetime
import requests

# Load environment variables from .env
load_dotenv()

# Database connection URL
DATABASE_URL = os.getenv("DATABASE_URL")

# Check if DATABASE_URL is set
if DATABASE_URL is None:
    print("DATABASE_URL is not set in the environment variables.")
    exit(1)

# Global counters for events and tickets added to the database
total_events_processed = 0
total_tickets_processed = 0

# Define the STUK student organizations and their IDs
STUK_ORGANISATIONS = {
    "Blekingska Nationen": 2635,
    "Göteborgs Nation": 2653,
    "Hallands Nation": 2644,
    "Helsingkrona Nation": 2662,
    "Kalmar Nation": 2672,
    "Kristianstads Nation": 2680,
    "Lunds Nation": 2689,
    "Malmö Nation": 2698,
    "Smålands Nation": 2754,
    "Studentlund": 2513,
    "Sydskånska Nationen": 2708,
    "Västgöta Nation": 2710,
    "Wermlands Nation": 2709,
    "Östgöta Nation": 2711
}

def main():
    # Scrape and format events from STUK
    stuk_events = get_stuk_events(STUK_ORGANISATIONS)
    
    # Check if events were found
    if not stuk_events:
        print("No events found ")
        return
    
    # Loop through each event
    print("ADDING EVENTS TO DATABASE")
    for event in stuk_events:
        
        # Add event to the database
        db_event_id = add_event_to_database(event)

        # If event insertion was successful
        if db_event_id:
            # Add associated tickets to the database
            for ticket_details in event.get("tickets", []):
                add_ticket_to_database(db_event_id, ticket_details)
        else:
            # If event insertion failed, skip adding tickets
            print(f"Skipping tickets for event '{event['name']}' due to insertion error.")

def get_stuk_events(organisations):
    '''
    Fetches events from STUK API and formats them for database insertion.
    '''
    
    # Create an empty list to store formatted events
    formatted_events = []
    
    # Loop through each organization
    for org_name, org_id in organisations.items():
        # Define the URL for the STUK API
        URL = f"https://api.studentkortet.se/organization/{org_id}/organization-events"
        
        # Make a GET request
        response = requests.get(URL)
        
        # Check if the request was successful
        if response.status_code != 200:
            # Print error message
            print(f"Failed to fetch data for {org_name}, status code {response.status_code}")
            return None
        
        # Save the response data as JSON
        print(f"Request successful, status code {response.status_code}")
        event_data = response.json()

        # Check if there is event data
        if event_data is None:
            print(f"No event data was given")
            return []

        # Loop through each event in the event data
        for event in event_data:
            print("Fetching: " + event.get("title"))
            
            # Get event details
            event_title = event.get("title")
            event_description = event.get("content")

            # Get each event occurrence
            occurrences = event.get("organization_event_occurrences", [])

            # Loop through each occurrence
            for occurrence in occurrences:
                
                # Create an empty list to store formatted tickets
                formatted_tickets = []

                # Get ticket data from the occurrence
                ticket_data = occurrence.get("tickets", [])

                # Check if there are tickets available
                if ticket_data:
                    print("Tickets found for event: " + event_title)
                    
                    # Loop through each ticket
                    for ticket in ticket_data:
                        
                        # Remove trailing zeros
                        if ticket.get("price") is not None:
                            price = ticket.get("price") / 100
                        
                        # Format the ticket data
                        formatted_ticket = {
                            "name": ticket.get("name"),
                            "ticket_count": ticket.get("count"),
                            "price": price,
                            "active": ticket.get("is_active"),
                            "max_count_per_person": ticket.get("max_count_per_member")
                        }

                        # Add the formatted ticket to the list
                        formatted_tickets.append(formatted_ticket)
                else:
                    print("No tickets found for event: " + event_title)

                # Create a bouncer link for the event
                bouncer_link = f"https://ob.addreax.com/{org_id}/events/{occurrence.get('organization_event_id')}/occur/{occurrence.get('id')}"
                
                # Combine IDs
                event_id = occurrence.get("organization_event_id")
                occurrence_id = occurrence.get("id")
                combined_id = f"{event_id}{occurrence_id}"

                # Create a formatted event dictionary
                formatted_event = {
                    "id": combined_id,
                    "organization_id": org_id,
                    "organization_name": org_name,
                    "name": event_title,
                    "description": BeautifulSoup(event_description, "html.parser").get_text(),
                    "address": occurrence.get("address"),
                    "start_date": occurrence.get("start_date"),
                    "end_date": occurrence.get("end_date"),
                    "link": bouncer_link,
                    "tickets": formatted_tickets
                }
                
                # Get the current date and time
                current_datetime = datetime.datetime.now()
                event_start_datetime = datetime.datetime.strptime(occurrence.get("start_date"), "%Y-%m-%dT%H:%M:%S.%fZ")
                
                # Check if the event has already happened
                if event_start_datetime < current_datetime:
                    print(f"Skipping {event_title}, has already happened.")
                    continue
                
                # Add the formatted event to the list
                print("Adding event to list: " + event_title)
                formatted_events.append(formatted_event)
                
    # Return the list of formatted events
    print(f"Returning {len(formatted_events)} events from STUK API")
    return formatted_events

def add_event_to_database(event_details):
    """
    Adds or updates an event in the database and returns its primary key (id).
    Returns None if operation fails.
    """
    global total_events_processed
    
    # Reset variables
    conn = None
    cursor = None
    db_event_id = None
    
    try:
        # Connect to the database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        # Define the SQL query to upsert an event
        upsert_query = """
        INSERT INTO events (id, organization_id, organization_name, name, description, address, start_date, end_date, link)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET
            organization_id = EXCLUDED.organization_id,
            organization_name = EXCLUDED.organization_name,
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            address = EXCLUDED.address,
            start_date = EXCLUDED.start_date,
            end_date = EXCLUDED.end_date,
            link = EXCLUDED.link
        RETURNING id;
        """
        
        # Execute the query with the event details
        cursor.execute(upsert_query, (
            event_details["id"],
            event_details["organization_id"],
            event_details["organization_name"],
            event_details["name"],
            event_details["description"],
            event_details["address"],
            event_details["start_date"],
            event_details["end_date"],
            event_details["link"]
        ))

        # Get the event_id that was generated by the database
        db_event_id = cursor.fetchone()[0]
        
        # Commit the transaction
        conn.commit()
        
        # Print info about the event
        print(f"DATABASE Processed event: '{event_details['name']}' with DB ID: {db_event_id}")
        
        # Increment the global counter for events added to the database
        total_events_processed += 1
        
        # Return the auto-generated primary key (id)
        return db_event_id

    except Exception as e:
        # Print error message
        print(f"DATABASE Error processing event {e}")
        
        # If an error occurs, rollback the transaction
        if conn:
            conn.rollback() # Rollback on error
            
        # Return None on failure
        return None
    finally:
        # Close the cursor and connection
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def add_ticket_to_database(db_event_id, ticket_info):
    """
    Adds or updates a ticket to the database for a given event.
    """
    global total_tickets_processed
    
    # Reset variables
    conn = None
    cursor = None
    
    try:
        # Connect to the database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        # Define the SQL query to upsert a ticket
        upsert_query = """
        INSERT INTO tickets (event_id, name, price, active, count, max_count_per_person)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (event_id, name) DO UPDATE SET
            price = EXCLUDED.price,
            active = EXCLUDED.active,
            count = EXCLUDED.count,
            max_count_per_person = EXCLUDED.max_count_per_person
        RETURNING id; 
        """
        
        # Execute the query with the ticket details
        cursor.execute(upsert_query, (
            db_event_id, # This is the foreign key to the events table
            ticket_info.get("name"),
            ticket_info.get("price"),
            ticket_info.get("active"),
            ticket_info.get("ticket_count"),
            ticket_info.get("max_count_per_person")
        ))

        # Commit the transaction
        conn.commit()
        
        # Print info about the ticket
        print(f"DATABASE Processed ticket: '{ticket_info.get('name')}' for event ID {db_event_id}")
        
        # Increment the global counter for tickets added to the database
        total_tickets_processed += 1

    except Exception as e:
        # Print error message
        print(f"DATABASE Error processing ticket '{ticket_info.get('name')}': {e}")
        
        # If an error occurs, rollback the transaction
        if conn:
            conn.rollback()
    finally:
        # Close the cursor and connection
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Entry point for the script
if __name__ == "__main__":
    print("Starting the script...")
    main()
    print("Script finished.")
    print(f"Total events processed by database: {total_events_processed}")
    print(f"Total tickets processed by database: {total_tickets_processed}")