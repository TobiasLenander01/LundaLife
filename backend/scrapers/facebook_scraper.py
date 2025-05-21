import utils
from datetime import datetime, timezone
import pytz

def get_facebook_events(organization):
    
    # Create an empty list to store events
    events = []
    
    # Check if organization has a fb_org_id
    if not organization.get("fb_org_id"):
        print(f"No fb_org_id found for {organization["name"]}")
        return []
    
    # Define URL for the facebook organization events
    url = f"https://www.facebook.com/{organization["fb_org_id"]}/events"
    
    # Console log
    print(f"Found facebook url for {organization["name"]}: {url}")
    
    # Get request
    html = utils.get_html(url)
    
    # Check if get request succeeded
    if not html:
        print(f"Facebook GET request for {organization["name"]} failed")
        return []
    
    # Get json data from html
    json = utils.html_to_json(html)
    
    # Find event ids
    event_ids = utils.find(json, "node/node/id")
    
    # Add formatted event into list
    for fb_event_id in event_ids:
        # Get the current date 
        current_date = datetime.now(timezone.utc)
        
        # Get event date
        start_timestamp = utils.find(json, "event/start_timestamp")[0]
        start_datetime = datetime.fromtimestamp(start_timestamp, tz=timezone.utc)
        
        # Check if the event has already happened
        # if start_datetime < current_date:
        #     print(f"Skipping facebook event with id {fb_event_id} {start_datetime} has already happened.")
        #     continue
        
        # Get and format event
        event = get_facebook_event(organization, fb_event_id)
        
        # If an event was successfully formatted
        if event:
            # Add event to list
            events.append(event)
            
            # Console log
            print(f"Retrieved {event["name"]} from facebook")
    
    # Return list of events
    return events

def get_facebook_event(organization, fb_event_id):
    
    # Define URL for the facebook event
    url = f"https://www.facebook.com/events/{fb_event_id}"
    
    # Get request
    html = utils.get_html(url)
    
    # Check if get request succeeded
    if not html:
        print(f"GET request for event {fb_event_id} failed")
        return None

    # Get json data from html
    json = utils.html_to_json(html)
    
    # Get timezone
    stockholm = pytz.timezone("Europe/Stockholm")

    # Convert from UTC timestamp → Stockholm time
    start_timestamp = utils.find(json, "data/start_timestamp")[0]
    start_date_utc = datetime.fromtimestamp(start_timestamp, tz=timezone.utc)
    start_date = start_date_utc.astimezone(stockholm)
    start_date_string = start_date.strftime("%Y-%m-%d %H:%M")

    end_timestamp = utils.find(json, "data/end_timestamp")[0]
    end_date_utc = datetime.fromtimestamp(end_timestamp, tz=timezone.utc)
    end_date = end_date_utc.astimezone(stockholm)
    end_date_string = end_date.strftime("%Y-%m-%d %H:%M")

    # Format event_id
    start_date_string_numeric = start_date.strftime("%Y%m%d%H%M")
    event_id = int(f"{organization['stuk_org_id']}{start_date_string_numeric}")
    
    # Get address
    address = utils.find(json, "event_place/contextual_name")[0]
    if not address:
        address = organization["address"]
    
    # Format event data in a dictionary
    event = {
        "id": event_id,
        "organization_id": organization["fb_org_id"],
        "organization_name": utils.find(json, "entity/short_name")[0],
        "name": utils.find(json, "meta/title")[0],
        "description": utils.find(json, "event_description/text")[0],
        "address": address,
        "image": utils.find(json, "full_image/uri")[0],
        "start_date": start_date_string,
        "end_date": end_date_string,
        "link": utils.find(json, "event/url")[0]
    }
    
    # Console message
    print(f"Found {event["organization_name"]} facebook event: {event["name"]} {event["link"]}")
    
    # Return the formatted event dictionary
    return event