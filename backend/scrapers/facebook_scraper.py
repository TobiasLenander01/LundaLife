import utils
from datetime import datetime, timezone
import json as json_module

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
    
    with open("facebook_event.json", "w", encoding="utf-8") as f:
        json_module.dump(json, f, ensure_ascii=False, indent=2)
    
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
        if start_datetime < current_date:
            print(f"Skipping facebook event with id {fb_event_id} has already happened.")
            continue
        
        # Get and format event
        event = get_facebook_event(fb_event_id)
        
        # If an event was successfully formatted
        if event:
            # Add event to list
            events.append(event)
            
            # Console log
            print(f"Retrieved {event["name"]} from facebook")
    
    # Return list of events
    return events

def get_facebook_event(fb_event_id):
    
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
    
    # Format time
    start_timestamp = utils.find(json, "data/start_timestamp")[0]
    start_datetime = datetime.fromtimestamp(start_timestamp, tz=timezone.utc)
    start_datestring = start_datetime.strftime(utils.TIME_FORMAT) + "Z"
    end_timestamp = utils.find(json, "data/end_timestamp")[0]
    end_datetime = datetime.fromtimestamp(end_timestamp, tz=timezone.utc)
    end_datestring = end_datetime.strftime(utils.TIME_FORMAT) + "Z"
    
    # Format event data in a dictionary
    event = {
        "id": utils.find(json, "params/event_id")[0],
        "organization_id": utils.find(json, "entity/id")[0],
        "organization_name": utils.find(json, "entity/short_name")[0],
        "name": utils.find(json, "meta/title")[0],
        "description": utils.find(json, "event_description/text")[0],
        "address": utils.find(json, "event_place/contextual_name")[0],
        "image": utils.find(json, "full_image/uri")[0],
        "start_date": start_datestring,
        "end_date": end_datestring,
        "link": utils.find(json, "event/url")[0]
    }
    
    # Console message
    print(f"Found {event["organization_name"]} facebook event: {event["name"]} {event["link"]}")
    
    # Return the formatted event dictionary
    return event