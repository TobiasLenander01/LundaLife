import re
from bs4 import BeautifulSoup
import utils
from datetime import datetime, timezone
import pytz
import json as json_module

def get_facebook_events(organization):
    print(f"RETRIEVING FACEBOOK EVENTS FROM {organization["name"]}")
    
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
    event_ids = utils.json_search(json, "node/node/id")
    
    # Add formatted event into list
    for fb_event_id in event_ids:
        # Get the current date 
        current_date = datetime.now(timezone.utc)
        
        # Get event date
        start_timestamp = utils.json_search(json, "event/start_timestamp")[0]
        start_datetime = datetime.fromtimestamp(start_timestamp, tz=timezone.utc)
        
        # Check if the event has already happened
        if start_datetime < current_date:
            print(f"Skipping facebook event with id {fb_event_id} {start_datetime} has already happened.")
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
        return

    # Get json data from html
    json = utils.html_to_json(html)
    
    # Get timezone
    stockholm = pytz.timezone("Europe/Stockholm")
    
    # Format event data in a dictionary
    try:
        # Convert from UTC timestamp → Stockholm time
        start_timestamp = utils.json_search(json, "data/start_timestamp")[0]
        start_date_utc = datetime.fromtimestamp(start_timestamp, tz=timezone.utc)
        start_date = start_date_utc.astimezone(stockholm)
        start_date_string = start_date.strftime("%Y-%m-%d %H:%M")

        end_timestamp = utils.json_search(json, "data/end_timestamp")[0]
        end_date_utc = datetime.fromtimestamp(end_timestamp, tz=timezone.utc)
        end_date = end_date_utc.astimezone(stockholm)
        end_date_string = end_date.strftime("%Y-%m-%d %H:%M")
        
        event = {
            "event_id": utils.json_search(json, "event/id")[0],
            "organization_id": utils.json_search(json, "event_creator/id")[0],
            "organization_name": utils.json_search(json, "event_creator/name")[0],
            "name": utils.json_search(json, "event/name")[0],
            "description": utils.json_search(json, "event_description/text")[0],
            "address": utils.json_search(json, "event_place/contextual_name")[0],
            "image": utils.json_search(json, "full_image/uri")[0],
            "start_date": start_date_string,
            "end_date": end_date_string,
            "link": utils.json_search(json, "event/url")[0]
        }
    except IndexError:
        print(f"Values missing from facebook event {fb_event_id} json")
        return
    
    # Return the formatted event dictionary
    return event

def get_facebook_organizations():
    
    # Load html
    html = utils.load_html()

    # Parse html to soup
    soup = BeautifulSoup(html, 'html.parser')

    # This regex extracts the ID part after /events/ and before the next /
    event_ids = set()

    # Find event ids from html
    for a in soup.find_all('a', href=True):
        match = re.search(r'/events/(\d+)', a['href'])
        if match:
            event_ids.add(match.group(1))
    
    print(f"{len(event_ids)} EVENT_IDS FOUND IN HTML")
    
    retrieved_organization_ids = set()
    organizations = []
    
    # Loop through each event id
    for event_id in event_ids:
        
        # Try to get an event
        event = get_facebook_event(event_id)
        if not event:
            continue
        
        # Check if there is an organization id
        org_id = event.get("organization_id")
        if not org_id:
            print("NO ORGANIZATION ID")
            continue
        
        # Check if organization is already added
        if org_id in retrieved_organization_ids:
            print("ORGANIZATION ALREADY ADDED")
            continue
        
        # Check if id represents a user profile
        if any(c.isalpha() for c in org_id):
            print("ID CONTAINS LETTERS, SKIPPING USER PROFILE")
            continue
        
        # Define url
        url = f"https://www.facebook.com/{org_id}"
            
        # Get request
        html = utils.get_html(url)
        
        # Check if get request succeeded
        if not html:
            print(f"GET request for organization {org_id} failed")
            return

        # Get json data from html
        json = utils.html_to_json(html)
        
        # Try to get an address
        try:
            address = utils.json_search(json, "context_item/title/text")[1] #Address is the second context_item
        except:
            address = event["address"]
            
        # Skip organization if no address was found
        if not address:
            print("NO ADDRESS FOUND")
            continue

        # Skip organization if no organization name is found
        if not event.get("organization_name"):
            print("NO ORGANIZATION NAME FOUND")
            continue
            
        # Check if address is in lund
        if "lund" not in address.lower():
            print("ORGANIZATION IS NOT IN LUND")
            continue
        
        # Format organization
        organization = {
            "name": event["organization_name"],
            "address": address,
            "fb_org_id": org_id,
        }
        
        # Add organization to list
        print(organization)
        organizations.append(organization)
        retrieved_organization_ids.add(org_id)

    print("SAVING TO FILE")
    with open("facebook_organizations.json", "w", encoding="utf-8") as f:
        for org in organizations:
            json_str = json.dumps(org, ensure_ascii=False)
            f.write(f"{json_str},\n")
        