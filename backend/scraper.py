from dotenv import load_dotenv
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

def main():
    # Loop through each nation
    for nation_name, nation_id in NATIONS.items():
        print(f"--- Processing Nation: {nation_name} (ID: {nation_id}) ---")
        nation_events = scrape_event_data(nation_id)
        
        print("NATION EVENTS:")
        print(nation_events)

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

# Function to get the response from the bouncer link
def get_bouncer_response(bouncer_link):
    response = requests.get(bouncer_link)
    if response.status_code == 200:
        return response.json()
    return None


def scrape_event_data(nation_id):
    events = []
        
    event_data = get_event_data(nation_id)
    
    for event in event_data:
        event_title = event.get("title")
        event_description = event.get("content")
        
        print("EVENT TITLE:")
        print(event_title)

        occurrences = event.get("organization_event_occurrences", []) 

        for occurrence in occurrences: 

            tickets = []

            ticket_data = occurrence.get("tickets", [])

            for ticket in ticket_data:
                formatted_ticket = {
                "name": ticket.get("name"),
                "ticket_count": ticket.get("count"),
                "price": ticket.get("price"),
                "activite": ticket.get("is_active"),
                "max_count_per_person": ticket.get("max_count_per_member")
                }

                tickets.append(formatted_ticket)


            bouncer = occurrence.get("bouncer")
            if bouncer:
                bouncer_link = bouncer.get("bouncer_link")
                if bouncer_link:
                    # Get the bouncer response
                    bouncer_response = get_bouncer_response(bouncer_link)
                    if bouncer_response:
                        # Print and send the desired URL from the bouncer response to Telegram
                        bounce_url = bouncer_response.get("bounce")


            event_occurrence_data = {
                "occurrence_id": occurrence.get("id"),
                "event_id": occurrence.get("organization_event_id"),
                "start_date": occurrence.get("start_date"),
                "end_date": occurrence.get("end_date"),
                "address": occurrence.get("address"),
            }
            
            if bounce_url:
                event_occurrence_data["link"] = bounce_url

            events.append(event_occurrence_data)

    return events



def add_ticket_to_database(db_event_id, ticket_info):
    """
    Adds a ticket to the database for a given event.
    """
    
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
        INSERT INTO events (event_id, occurrence_id, nation_id, name, description, link, start_date, end_date)
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
            event_details["link"],
            event_details["start_date"],
            event_details["end_date"]
        ))

        # Get the event_id that was generated by the database
        db_event_id = cursor.fetchone()[0]
        
        # Commit the transaction
        conn.commit()
        
        # Print info about the inserted event
        print(f"Inserted event: '{event_details['name']}' with DB ID: {db_event_id}")
        
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