import utils
from datetime import datetime, timezone
import pytz

def get_facebook_events(organization, skip_old=True):
    
    # Create an empty list to store events
    events = []
    
    # Check if organization has a fb_id
    if not organization.get("fb_id"):
        print(f"No fb_id found for {organization["name"]}")
        return []
    
    # Define URL for the facebook organization events
    url = f"https://www.facebook.com/{organization['fb_id']}/events"
    
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
        if skip_old:
            if start_datetime < current_date:
                print(f"Skipping facebook event with id {fb_event_id} {start_datetime} has already happened.")
                continue
        
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
    
    try:
        # Get time and convert from UTC timestamp → Stockholm time
        start_timestamp = utils.find(json, "data/start_timestamp")[0]
        start_date_utc = datetime.fromtimestamp(start_timestamp, tz=timezone.utc)
        start_date = start_date_utc.astimezone(stockholm)
        start_date_string = start_date.strftime("%Y-%m-%d %H:%M")
        end_timestamp = utils.find(json, "data/end_timestamp")[0]
        end_date_utc = datetime.fromtimestamp(end_timestamp, tz=timezone.utc)
        end_date = end_date_utc.astimezone(stockholm)
        end_date_string = end_date.strftime("%Y-%m-%d %H:%M")
        
        # Get address
        address = utils.find(json, "event_place/contextual_name")[0]
        if not address:
            address = organization["address"]
            
        # Format event data in a dictionary
        event = {
            "organization_id": organization["id"],
            "organization_name": utils.find(json, "entity/short_name")[0],
            "name": utils.find(json, "meta/title")[0],
            "description": utils.find(json, "event_description/text")[0],
            "address": address,
            "latitude": utils.find(json, "location/latitude")[0],
            "longitude": utils.find(json, "location/longitude")[0],
            "image": utils.find(json, "full_image/uri")[0],
            "start_date": start_date_string,
            "end_date": end_date_string,
            "link": utils.find(json, "event/url")[0]
        }
        
    except:
        print(f"Failed to get all values for event {fb_event_id}, returning None")
        return None
    
    # Console message
    print(f"Found {event['organization_name']} facebook event: {event['name']} {event['link']}")
    
    # Return the formatted event dictionary
    return event

def get_facebook_organization(url):
    
    # Get request
    html = utils.get_html(url)
    
    # Check if get request succeeded
    if not html:
        print(f"GET request for organization failed")
        return None

    # Get json data from html
    json = utils.html_to_json(html)
    
    # Format organization
    organization = {
        "id": 123,
        "name": utils.find(json, "user/name")[0],
        "address": utils.find(json, "context_item/title/text")[1],
        "fb_id": utils.find(json, "user/id")[0],
        "icon": utils.find(json, "profile_picture_for_sticky_bar/uri")[0]
    }
    
    # Get event
    event = get_facebook_events(organization, False)[0]
    
    # Get coordinates from event
    if event:
        organization["latitude"] = event["latitude"]
        organization["longitude"] = event["longitude"]
    
    organization["id"] = None
    
    return organization