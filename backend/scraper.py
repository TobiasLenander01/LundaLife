from dotenv import load_dotenv
import os
import psycopg2
import datetime

# Load environment variables from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Nation names mapped to existing nation IDs in the database
NATIONS = {
    "Malmös": 2698,
    "Göteborgs": 2653,
    "Blekingskas": 2635,
    "Östgötas": 2711,
    "Lunds": 2689,
    "Västgötas": 2710,
    "Wermlands": 2709,
    "Sydskånskas": 2708,
    "Kristianstads": 2680,
    "Kalmars": 2672,
    "Helsingkronas": 2662,
    "Hallands": 2644,
    "Smålands": 2754
}

def main():
    for nation, nation_id in NATIONS.items():
        event_data = scrape_nation_data(nation, nation_id)
        add_event_to_database(event_data)

def scrape_nation_data(nation, nation_id):
    # Simulated event data
    return {
        "name": f"{nation} Annual Party",
        "description": f"A wonderful evening at {nation}.",
        "nation_id": nation_id,
        "ticket_id": None,  # No ticket assigned (optional)
        "link": f"https://{nation.lower()}.se/event",
        "start_date": datetime.datetime.now(),
        "end_date": datetime.datetime.now() + datetime.timedelta(hours=4)
    }

def add_event_to_database(event):
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        insert_query = """
        INSERT INTO events (name, description, nation_id, ticket_id, link, start_date, end_date)
        VALUES (%s, %s, %s, %s, %s, %s, %s);
        """
        cursor.execute(insert_query, (
            event["name"],
            event["description"],
            event["nation_id"],
            event["ticket_id"],
            event["link"],
            event["start_date"],
            event["end_date"]
        ))

        conn.commit()
        print(f"Inserted event: {event['name']}")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error inserting event: {e}")

if __name__ == "__main__":
    main()
