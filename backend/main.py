from scrapers import facebook_scraper, stuk_scraper
from database import database as db

ORGANISATIONS = [
    { "name": "Blekingska Nationen", "address": "Ole römers väg 14D, 22363, Lund", "stuk_id": 2635 },
    { "name": "Göteborgs Nation", "address": "Östra Mårtensgatan 15, 223 61, Lund", "stuk_id": 2653 },
    { "name": "Hallands Nation", "address": "Thomanders väg 3, 224 65, Lund", "stuk_id": 2644 },
    { "name": "Helsingkrona Nation", "address": "Tornavägen 3C, 223 64, Lund", "stuk_id": 2662 },
    { "name": "Kalmar Nation", "address": "Biskopsgatan 12, 22362, Lund", "stuk_id": 2672 },
    { "name": "Kristianstads Nation", "address": "Tornavägen 7, 22363, Lund", "stuk_id": 2680 },
    { "name": "Lunds Nation", "address": "Agardhsgatan 1, 22351, Lund", "stuk_id": 2689 },
    { "name": "Malmö Nation", "address": "Ö:a Vallgatan 51, 22361, Lund", "stuk_id": 2698 },
    { "name": "Smålands Nation", "address": "Kastanjegatan 7, 223 59, Lund", "stuk_id": 2754 },
    { "name": "Studentlund", "address": "Sandgatan 2, 22350, Lund", "stuk_id": 2513 },
    { "name": "Sydskånska Nationen", "address": "Tornavägen 5, 223 63, Lund", "stuk_id": 2708 },
    { "name": "Västgöta Nation", "address": "Tornavägen 17-19, 223 64, Lund", "stuk_id": 2710 },
    { "name": "Wermlands Nation", "address": "Stora Tvärgatan 13, 22353, Lund", "stuk_id": 2709 },
    { "name": "Östgöta Nation", "address": "Adelgatan 4, 22350, Lund", "stuk_id": 2711, "fb_id": 1144572210449522 }
]

def main():
    # Scrape and format events from STUK
    events = stuk_scraper.get_stuk_events(ORGANISATIONS)
    
    # Check if events were found
    if not events:
        print("No events found ")
        return
    
    # Loop through each event
    print("ADDING EVENTS TO DATABASE")
    for event in events:
        
        # Add event to the database
        db_event_id = db.add_event(event)

        # If event insertion was successful
        if db_event_id:
            # Add associated tickets to the database
            for ticket_details in event.get("tickets", []):
                db.add_ticket(db_event_id, ticket_details)
        else:
            # If event insertion failed, skip adding tickets
            print(f"Skipping tickets for {event['name']}.")
    

# Entry point for the script
if __name__ == "__main__":
    print("Starting the script...")
    main()
    print("Script finished.")