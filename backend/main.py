from scrapers import facebook_scraper, stuk_scraper
from database import database as db

ORGANIZATIONS = [
    { "name": "Blekingska Nationen", "address": "Ole römers väg 14D, 22363, Lund", "stuk_org_id": 2635, "fb_org_id": 100064162616790 },
    { "name": "Göteborgs Nation", "address": "Östra Mårtensgatan 15, 223 61, Lund", "stuk_org_id": 2653, "fb_org_id": 100064851186016 },
    { "name": "Hallands Nation", "address": "Thomanders väg 3, 224 65, Lund", "stuk_org_id": 2644, "fb_org_id": 100064522996227 },
    { "name": "Helsingkrona Nation", "address": "Tornavägen 3C, 223 64, Lund", "stuk_org_id": 2662, "fb_org_id": 100064870894985 },
    { "name": "Kalmar Nation", "address": "Biskopsgatan 12, 22362, Lund", "stuk_org_id": 2672, "fb_org_id": 100064981440086 },
    { "name": "Kristianstads Nation", "address": "Tornavägen 7, 22363, Lund", "stuk_org_id": 2680, "fb_org_id": 100071528409393 },
    { "name": "Lunds Nation", "address": "Agardhsgatan 1, 22351, Lund", "stuk_org_id": 2689, "fb_org_id": 100064567578751 },
    { "name": "Malmö Nation", "address": "Ö:a Vallgatan 51, 22361, Lund", "stuk_org_id": 2698, "fb_org_id": 100064705357573},
    { "name": "Smålands Nation", "address": "Kastanjegatan 7, 223 59, Lund", "stuk_org_id": 2754, "fb_org_id": 100064514507230 },
    { "name": "Studentlund", "address": "Sandgatan 2, 22350, Lund", "stuk_org_id": 2513, "fb_org_id": 100064566888894 },
    { "name": "Sydskånska Nationen", "address": "Tornavägen 5, 223 63, Lund", "stuk_org_id": 2708, "fb_org_id": 100064367122361 },
    { "name": "Västgöta Nation", "address": "Tornavägen 17-19, 223 64, Lund", "stuk_org_id": 2710, "fb_org_id": 100064344053184 },
    { "name": "Wermlands Nation", "address": "Stora Tvärgatan 13, 22353, Lund", "stuk_org_id": 2709, "fb_org_id": 100066387433646 },
    { "name": "Östgöta Nation", "address": "Adelgatan 4, 22350, Lund", "stuk_org_id": 2711, "fb_org_id": 100064521016782 }
]

def main():
    
    # Create empty lists to store events
    events_stuk = []
    events_facebook = []
    
    # Loop through each organization
    for organization in ORGANIZATIONS:
        
        print(f"STARTED SCRAPING FACEBOOK EVENTS FOR {organization["name"]}")
        
        # Add facebook events to list
        events_facebook.extend(facebook_scraper.get_facebook_events(organization))
        
        print(f"STARTED SCRAPING STUK EVENTS FOR {organization["name"]}")
        
        # Add stuk events to list
        events_stuk.extend(stuk_scraper.get_stuk_events(organization))
    
    print() # Empty line
    print("-------------------------")
    print(f"EVENTS SCRAPED FROM STUK: {len(events_stuk)}")
    print(f"EVENTS SCRAPED FROM FACEBOOK: {len(events_facebook)}")
    print(f"EVENTS SCRAPED TOTAL: {len(events_stuk) + len(events_facebook)}")
    print("-------------------------")
    
    print() # Empty line    
    print("ADDING FACEBOOK EVENTS TO DATABASE")
    
    # Loop through facebook  events
    db_count_facebook = 0
    for event in events_facebook:
        # Add event to the database
        db_event_id = db.upsert_event(event)
        
        # If event insertion was successful
        if db_event_id:
            db_count_facebook += 1
            
    print() # Empty line
    print("ADDING STUK EVENTS TO DATABASE")
    
    # Loop through stuk events
    db_count_stuk = 0
    db_count_ticket = 0
    for event in events_stuk:
        # Add event to the database
        db_event_id = db.upsert_event(event)

        # If event insertion was successful
        if db_event_id:
            db_count_stuk += 1
            
            # Add associated tickets to the database
            for ticket_details in event.get("tickets", []):
                db_count_ticket += 1
                db.upsert_ticket(db_event_id, ticket_details)
    
    print() # Empty line
    print("-------------------------")
    print(f"EVENTS PROCESSED BY DB FROM STUK: {db_count_stuk}")
    print(f"EVENTS PROCESSED BY DB FROM FACEBOOK: {db_count_facebook}")
    print(f"EVENTS PROCESSED BY DB TOTAL: {db_count_stuk + db_count_facebook}")
    print(f"TICKETS PROCESSED BY DB TOTAL: {db_count_ticket}")
    print("-------------------------")
    print() # Empty line
    

# Entry point for the script
if __name__ == "__main__":
    print("Starting the script...")
    main()
    print("Script finished.")