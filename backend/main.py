from scrapers import facebook_scraper, stuk_scraper
from database import database as db

def main():
    # Load organizations from database
    organizations = db.get_all_organizations()
    
    # Create empty lists to store events
    events_stuk = []
    events_facebook = []
    
    # Loop through each organization
    for organization in organizations:
        
        print(f"STARTED SCRAPING STUK EVENTS FOR {organization['name']}")
        
        # Add stuk events to list
        events_stuk.extend(stuk_scraper.get_stuk_events(organization))
        
        print(f"STARTED SCRAPING FACEBOOK EVENTS FOR {organization['name']}")
        
        # Add facebook events to list
        events_facebook.extend(facebook_scraper.get_facebook_events(organization))
    
    print() # Empty line
    print("-------------------------")
    print(f"EVENTS SCRAPED FROM STUK: {len(events_stuk)}")
    print(f"EVENTS SCRAPED FROM FACEBOOK: {len(events_facebook)}")
    print(f"EVENTS SCRAPED TOTAL: {len(events_stuk) + len(events_facebook)}")
    print("-------------------------")
    
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
    print("-------------------------")
    print(f"EVENTS PROCESSED BY DB FROM STUK: {db_count_stuk}")
    print(f"EVENTS PROCESSED BY DB FROM FACEBOOK: {db_count_facebook}")
    print(f"EVENTS PROCESSED BY DB TOTAL: {db_count_stuk + db_count_facebook}")
    print(f"TICKETS PROCESSED BY DB TOTAL: {db_count_ticket}")
    print("-------------------------")
    print() # Empty line
    
def get_organizations(urls):
    
    for url in urls:
        organization = facebook_scraper.get_facebook_organization(url)
        db.upsert_organization(organization)

# Entry point for the script
if __name__ == "__main__":
    print("Starting the script...")
    main()
    print("Script finished.")