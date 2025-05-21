from scrapers import facebook_scraper, stuk_scraper
from database import database as db
import json as json_module

ORGANIZATIONS = [
    { "name": "Blekingska Nationen", "address": "Ole römers väg 14D, 22363, Lund", "stuk_id": 2635, "fb_id": 100064162616790 },
    { "name": "Göteborgs Nation", "address": "Östra Mårtensgatan 15, 223 61, Lund", "stuk_id": 2653, "fb_id": 100064851186016 },
    { "name": "Hallands Nation", "address": "Thomanders väg 3, 224 65, Lund", "stuk_id": 2644, "fb_id": 100064522996227 },
    { "name": "Helsingkrona Nation", "address": "Tornavägen 3C, 223 64, Lund", "stuk_id": 2662, "fb_id": 100064870894985 },
    { "name": "Kalmar Nation", "address": "Biskopsgatan 12, 22362, Lund", "stuk_id": 2672, "fb_id": 100064981440086 },
    { "name": "Kristianstads Nation", "address": "Tornavägen 7, 22363, Lund", "stuk_id": 2680, "fb_id": 100071528409393 },
    { "name": "Lunds Nation", "address": "Agardhsgatan 1, 22351, Lund", "stuk_id": 2689, "fb_id": 100064567578751 },
    { "name": "Malmö Nation", "address": "Ö:a Vallgatan 51, 22361, Lund", "stuk_id": 2698, "fb_id": 100064705357573},
    { "name": "Smålands Nation", "address": "Kastanjegatan 7, 223 59, Lund", "stuk_id": 2754, "fb_id": 100064514507230 },
    { "name": "Studentlund", "address": "Sandgatan 2, 22350, Lund", "stuk_id": 2513, "fb_id": 100064566888894 },
    { "name": "Sydskånska Nationen", "address": "Tornavägen 5, 223 63, Lund", "stuk_id": 2708, "fb_id": 100064367122361 },
    { "name": "Västgöta Nation", "address": "Tornavägen 17-19, 223 64, Lund", "stuk_id": 2710, "fb_id": 100064344053184 },
    { "name": "Wermlands Nation", "address": "Stora Tvärgatan 13, 22353, Lund", "stuk_id": 2709, "fb_id": 100066387433646 },
    { "name": "Östgöta Nation", "address": "Adelgatan 4, 22350, Lund", "stuk_id": 2711, "fb_id": 100064521016782 }
]

def main():
    
    # Create an empty list to store events
    events = []
    
    # Loop through each organization
    for organization in ORGANIZATIONS:
        
        # Scrape facebook events
        events.extend(facebook_scraper.get_facebook_events(organization))
    
    
    with open("events.json", "w", encoding="utf-8") as f:
        json_module.dump(events, f, ensure_ascii=False, indent=2)
    
    
    # DATABASE INSERTION
    # print("ADDING EVENTS TO DATABASE")
    # for event in events:
        
    #     # Add event to the database
    #     db_event_id = db.add_event(event)

    #     # If event insertion was successful
    #     if db_event_id:
    #         # Add associated tickets to the database
    #         for ticket_details in event.get("tickets", []):
    #             db.add_ticket(db_event_id, ticket_details)
    #     else:
    #         # If event insertion failed, skip adding tickets
    #         print(f"Skipping tickets for {event['name']}.")
    

# Entry point for the script
if __name__ == "__main__":
    print("Starting the script...")
    main()
    print("Script finished.")