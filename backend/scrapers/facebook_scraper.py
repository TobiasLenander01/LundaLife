from scrapers import utils
import json as json_module
from datetime import datetime

def get_facebook_events(organization):
    
    # Create an empty list to store events
    events = []
    
    # Check if organization has a fb_id
    if not organization.get("fb_id"):
        print(f"No facebook url found for {organization["name"]}")
        return []
    
    # Define URL for the facebook organization events
    url = f"https://www.facebook.com/{organization["fb_id"]}/events"
    
    # Print for testing purposes
    print(f"Found facebook url for {organization["name"]}: {url}")
    
    # Get request
    html = utils.get_html(url)
    
    # Get json data from html
    json = utils.html_to_json(html)
    
    # Find event ids
    event_ids = utils.find(json, "node/node/id")
    
    # Add formatted event into list
    for event_id in event_ids:
        events.append(get_facebook_event(event_id))
    
    # Return list of events
    return events

def get_facebook_event(fbid):
    
    # Define URL for the facebook event
    url = f"https://www.facebook.com/events/{fbid}"
    
    # Get request
    html = utils.get_html(url)

    # Get json data from html
    json = utils.html_to_json(html)
    
    # Format event data in a dictionary
    formatted_event = {
        "id": utils.find(json, "params/event_id")[0],
        "organization_id": utils.find(json, "entity/id")[0],
        "organization_name": utils.find(json, "entity/short_name")[0],
        "name": utils.find(json, "meta/title")[0],
        "description": utils.find(json, "event_description/text")[0],
        "address": utils.find(json, "event_place/contextual_name")[0],
        "image": utils.find(json, "full_image/uri")[0],
        "start_date": str(datetime.fromtimestamp(utils.find(json, "data/start_timestamp")[0])),
        "end_date": str(datetime.fromtimestamp(utils.find(json, "data/end_timestamp")[0])),
        "link": utils.find(json, "event/url")[0]
    }
    
    # Debug message
    print(f"Found {formatted_event["organization_name"]} facebook event with id {fbid}: {formatted_event["name"]}")
    
    # Return the formatted event dictionary
    return formatted_event

# event = get_facebook_event(1144572210449522)
# print()
# print(json_module.dumps(event, indent=4, ensure_ascii=False))