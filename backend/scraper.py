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

# Nation names and their corresponding IDs
NATIONS = {
    "Blekingskas": 2635,
    "Göteborgs": 2653,
    "Hallands": 2644,
    "Helsingkronas": 2662,
    "Kalmars": 2672,
    "Kristianstads": 2680,
    "Lunds": 2689,
    "Malmös": 2698,
    "Smålands": 2754,
    "Sydskånskas": 2708,
    "Västgötas": 2710,
    "Wermlands": 2709,
    "Östgötas": 2711
}

total_events_added_to_db = 0
total_tickets_added_to_db = 0

def main():

    for nation_name, nation_id in NATIONS.items():
        nation_events = scrape_event_data(nation_id) # Test with a single nation ID
        
        print("ADDING EVENTS TO DATABASE")
        for event in nation_events:
            
            db_event_id = add_event_to_database(event)

            if db_event_id: # If event insertion was successful
                
                # Add associated tickets to the database
                for ticket_details in event.get("tickets", []): # Use .get for safety
                    add_ticket_to_database(db_event_id, ticket_details)
                    
                    
            else:
                print(f"Skipping tickets for event '{event['name']}' due to insertion error.")




def get_event_data(nation_id):
    URL = f"https://api.studentkortet.se/organization/{nation_id}/organization-events"
    response = requests.get(URL)
    print("RESPONSE CODE:")
    print(response.status_code)
    if response.status_code == 200:
        return response.json()
    print(f"Failed to fetch data for nation ID {nation_id}")
    return None


def scrape_event_data(nation_id):
    events = []
    nation_event_data = get_event_data(nation_id)

    if nation_event_data is None:
        print(f"No event data found for nation_id {nation_id}. Skipping.")
        return []

   
    for event in nation_event_data:
        event_title = event.get("title")
        event_description = event.get("content")
        print("Analyzing: " + event_title)

        occurrences = event.get("organization_event_occurrences", [])

        for occurrence in occurrences:
                               
            tickets = []

            ticket_data = occurrence.get("tickets", [])

            if ticket_data:
                print("Tickets found for event: " + event_title)
                for ticket in ticket_data:
                    formatted_ticket = {
                        "name": ticket.get("name"),
                        "ticket_count": ticket.get("count"),
                        "price": ticket.get("price"),
                        "active": ticket.get("is_active"),
                        "max_count_per_person": ticket.get("max_count_per_member")
                    }

                    tickets.append(formatted_ticket)
            else:
                print("No tickets found for event: " + event_title)

            bouncer_link = f"https://ob.addreax.com/{nation_id}/events/{occurrence.get("organization_event_id")}/occur/{occurrence.get("id")}"

            formatted_event = {
                "occurrence_id": occurrence.get("id"),
                "event_id": occurrence.get("organization_event_id"),
                "start_date": occurrence.get("start_date"),
                "end_date": occurrence.get("end_date"),
                "address": occurrence.get("address"),
                "nation_id": nation_id,
                "name": event_title,
                "description": BeautifulSoup(event_description, "html.parser").get_text(),
                "tickets": tickets,
                "link": bouncer_link
            }
            
            # Get the current date and time
            current_datetime = datetime.datetime.now()
            event_start_datetime = datetime.datetime.strptime(occurrence.get("start_date"), "%Y-%m-%dT%H:%M:%S.%fZ")
            
            # Check if the event has already happened
            if event_start_datetime < current_datetime:
                print(f"Skipping {event_title}, has already happened.")
                continue
            
            print("Adding event to list: " + event_title)
            events.append(formatted_event)

    print(f"Adding NATION {nation_id} events to the database")
    return events



def add_ticket_to_database(db_event_id, ticket_info):
    """
    Adds a ticket to the database for a given event.
    """
    global total_tickets_added_to_db
    
    # Reset variables
    conn = None
    cursor = None
    
    try:
        # Connect to the database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        # Define the SQL query to insert a ticket
        insert_query = """
        INSERT INTO tickets (event_id, name, price, active, count, max_count_per_person)
        VALUES (%s, %s, %s, %s, %s, %s);
        """
        
        # Execute the query with the ticket details
        cursor.execute(insert_query, (
            db_event_id, # This is the foreign key to the events table
            ticket_info.get("name"),
            ticket_info.get("price"),
            ticket_info.get("active"),
            ticket_info.get("count"),
            ticket_info.get("max_count_per_person")
        ))

        # Commit the transaction
        conn.commit()
        
        # Print info about the inserted ticket
        print(f"Inserted ticket: '{ticket_info.get('name')}' for event ID {db_event_id}")
        
        # Increment the global counter for tickets added to the database
        total_tickets_added_to_db += 1

    except Exception as e:
        # Print error message
        print(f"Error inserting ticket '{ticket_info.get('name')}': {e}")
        
        # If an error occurs, rollback the transaction
        if conn:
            conn.rollback()
    finally:
        # Close the cursor and connection
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def add_event_to_database(event_details):
    """
    Adds an event to the database and returns its auto-generated primary key (id).
    Returns None if insertion fails.
    """
    global total_events_added_to_db
    
    # Reset variables
    conn = None
    cursor = None
    db_event_id = None
    
    try:
        # Connect to the database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        # Define the SQL query to insert an event
        insert_query = """
        INSERT INTO events (event_id, occurrence_id, nation_id, name, description, start_date, end_date, link)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
        """
        
        # Execute the query with the event details
        cursor.execute(insert_query, (
            event_details["event_id"],
            event_details["occurrence_id"],
            event_details["nation_id"],
            event_details["name"],
            event_details["description"],
            event_details["start_date"],
            event_details["end_date"],
            event_details["link"]
        ))

        # Get the event_id that was generated by the database
        db_event_id = cursor.fetchone()[0]
        
        # Commit the transaction
        conn.commit()
        
        # Print info about the inserted event
        print(f"Inserted event: '{event_details['name']}' with DB ID: {db_event_id}")
        
        # Increment the global counter for events added to the database
        total_events_added_to_db += 1
        
        # Return the auto-generated primary key (id)
        return db_event_id

    except Exception as e:
        # Print error message
        print(f"Error inserting event {e}")
        
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


# Entry point for the script
if __name__ == "__main__":
    print("Starting the script...")
    main()
    print("Script finished.")
    print(f"Total events added to DB: {total_events_added_to_db}")
    print(f"Total tickets added to DB: {total_tickets_added_to_db}")