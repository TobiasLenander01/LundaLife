import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Database connection URL
DATABASE_URL = os.getenv("DATABASE_URL")

# Check if DATABASE_URL is set
if not DATABASE_URL:
    print("DATABASE_URL is not set in the environment variables.")
    exit(1)

# Helper to load SQL queries from files
def __load_query(query_name):
    # Construct path relative to this file
    path = os.path.join(os.path.dirname(__file__), "queries", f"{query_name}.sql")
    try:
        with open(path, "r") as f:
            return f.read()
    except FileNotFoundError:
        print(f"Error: SQL query file not found at {path}")
        raise
    except Exception as e:
        print(f"Error reading SQL query file {path}: {e}")
        raise

# Load queries
UPSERT_FB_EVENT_QUERY = __load_query("upsert_fb_event")
UPSERT_STUK_EVENT_QUERY = __load_query("upsert_stuk_event")
UPSERT_TICKET_QUERY = __load_query("upsert_ticket")

def upsert_event(event, event_type="stuk"):
    """
    Adds or updates a STUK or Facebook event in the database and returns its ID.
    event_type: "stuk" or "fb"
    """
    conn = None
    cursor = None
    db_event_id = None
    
    # Select query based on event type
    if event_type == "stuk":
        query = UPSERT_STUK_EVENT_QUERY
    elif event_type == "fb":
        query = UPSERT_FB_EVENT_QUERY
    else:
        raise ValueError("Unknown event type. Must be 'stuk' or 'fb'.")

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        cursor.execute(query, (
            event["id"],
            event["organization_id"],
            event["organization_name"],
            event["name"],
            event["description"],
            event["address"],
            event["image"],
            event["link"],
            event["start_date"],
            event["end_date"]
        ))

        db_event_id = cursor.fetchone()[0]
        conn.commit()

        print(f"DATABASE Processed {event_type.upper()} event: '{event['name']}' with DB ID: {db_event_id}")
        return db_event_id

    except Exception as e:
        print(f"DATABASE Error processing {event_type.upper()} event {e}")
        if conn:
            conn.rollback()
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def upsert_ticket(db_event_id, ticket):
    """
    Adds or updates a ticket to the database for a given event.
    """
    
    # Reset variables
    conn = None
    cursor = None
    
    try:
        # Connect to the database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Execute the query with the ticket details
        cursor.execute(UPSERT_TICKET_QUERY, (
            db_event_id, # This is the foreign key to the events table
            ticket.get("name"),
            ticket.get("price"),
            ticket.get("active"),
            ticket.get("ticket_count"),
            ticket.get("max_count_per_person")
        ))

        # Commit the transaction
        conn.commit()
        
        # Print info about the ticket
        print(f"DATABASE Processed ticket: '{ticket.get('name')}' for event ID {db_event_id}")

    except Exception as e:
        # Print error message
        print(f"DATABASE Error processing ticket '{ticket.get('name')}': {e}")
        
        # If an error occurs, rollback the transaction
        if conn:
            conn.rollback()
    finally:
        # Close the cursor and connection
        if cursor:
            cursor.close()
        if conn:
            conn.close()