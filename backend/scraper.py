from dotenv import load_dotenv
import os
import psycopg2
import datetime

# Load environment variables from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Nation names mapped to existing nation IDs in the database
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
        nation_events = scrape_event_data(nation_id, nation_name)

        for event in nation_events:
            
            db_event_id = add_event_to_database(event)

            if db_event_id: # If event insertion was successful
                
                
                # Add associated tickets to the database
                for ticket_details in event.get("tickets", []): # Use .get for safety
                    add_ticket_to_database(db_event_id, ticket_details)
                    
                    
            else:
                print(f"Skipping tickets for event '{event['name']}' due to insertion error.")




def scrape_event_data(nation_id, nation_name):
    return [
        {
            "event_id": 1000,  # Custom external ID, not the primary key
            "occurrence_id": 1,
            "nation_id": nation_id, # Use the actual nation_id passed
            "name": f"Förköp {nation_name} Event 1",
            "description": f"Sample description for {nation_name} event 1.",
            "link": f"http://example.com/{nation_name.lower()}/event1",
            "start_date": datetime.datetime.now(datetime.timezone.utc),
            "end_date": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=4),
            "tickets": [
                {
                    # "ticket_id" is not needed here, DB generates "id"
                    "name": "Förköp",
                    "price": 150.00,
                    "active": True,
                    "count": 100,
                    "max_count_per_person": 5
                },
                {
                    "name": "Förman VIP",
                    "price": 120.00,
                    "active": True,
                    "count": 50,
                    "max_count_per_person": 2
                }
            ]
        },
        {
            "event_id": 1001,
            "occurrence_id": 1,
            "nation_id": nation_id,
            "name": f"Sittning {nation_name} Event 2",
            "description": f"Another event for {nation_name}.",
            "link": f"http://example.com/{nation_name.lower()}/event2",
            "start_date": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7),
            "end_date": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7, hours=5),
            "tickets": [
                {
                    # "ticket_id" is not needed here, DB generates "id"
                    "name": "Förköp",
                    "price": 150.00,
                    "active": True,
                    "count": 100,
                    "max_count_per_person": 5
                },
                {
                    "name": "Förman VIP",
                    "price": 120.00,
                    "active": True,
                    "count": 50,
                    "max_count_per_person": 2
                }
            ]
        }
    ]

def add_ticket_to_database(db_event_id, ticket_info):
    conn = None
    cursor = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        insert_query = """
        INSERT INTO tickets (event_id, name, price, active, count, max_count_per_person)
        VALUES (%s, %s, %s, %s, %s, %s);
        """
        # Ensure all keys exist in ticket_info, provide defaults if necessary
        cursor.execute(insert_query, (
            db_event_id, # This is the foreign key to the events table
            ticket_info.get("name"),
            ticket_info.get("price"),
            ticket_info.get("active"),
            ticket_info.get("count"),
            ticket_info.get("max_count_per_person")
        ))

        conn.commit()
        print(f"Inserted ticket: '{ticket_info.get('name')}' for event ID {db_event_id}")

    except Exception as e:
        print(f"Error inserting ticket '{ticket_info.get('name')}': {e}")
        if conn:
            conn.rollback() # Rollback on error
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def add_event_to_database(event_details):
    """
    Adds an event to the database and returns its auto-generated primary key (id).
    Returns None if insertion fails.
    """
    conn = None
    cursor = None
    db_event_id = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        insert_query = """
        INSERT INTO events (event_id, occurrence_id, nation_id, name, description, link, start_date, end_date)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
        """ # Added RETURNING id
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

        db_event_id = cursor.fetchone()[0] # Get the returned id
        conn.commit()
        print(f"Inserted event: '{event_details['name']}' with DB ID: {db_event_id}")
        return db_event_id

    except Exception as e:
        print(f"Error inserting event '{event_details['name']}': {e}")
        if conn:
            conn.rollback() # Rollback on error
        return None # Return None on error
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    main()
    print("Script finished.")