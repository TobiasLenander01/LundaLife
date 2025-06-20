import requests
from bs4 import BeautifulSoup
import utils
from datetime import datetime, timezone
import pytz

def get_stuk_events(organization):
    
    # Get stuk_id
    stuk_id = organization['stuk_id']
    
    # Check if organization has a stuk_id
    if stuk_id is None:
        print(f"{organization.get('name')} has no stuk_id, skipping.")
        return []
    
    # Create an empty list to store formatted events
    events = []
    
    # Define URL for the stuk organization events
    url = f"https://api.studentkortet.se/organization/{organization['stuk_id']}/organization-events"
    
    # Console log
    print(f"Found stuk url for {organization['name']}: {url}")
    
    # Get request
    response = requests.get(url)
    
    # Check if the request was successful
    if response.status_code != 200:
        # Print error message
        print(f"Stuk GET request for {organization['name']} failed")
        return None
    
    # Convert the response data to json
    json = response.json()
    
    # Loop through each event in the raw json data
    for event in json:
        
        # Find occurrences
        occurrences = utils.find(event, "organization_event_occurrences")[0]
        
        # Loop through each occurrence
        for occurrence in occurrences:
            
            # Get the current date 
            current_date = datetime.now(timezone.utc)
            
            # Get occurrence date
            event_date = datetime.strptime(utils.find(occurrence, "start_date")[0], utils.TIME_FORMAT)
            event_date = event_date.replace(tzinfo=timezone.utc)
            
            # Check if the event has already happened
            if event_date < current_date:
                print(f"Skipping stuk event {utils.find(occurrence, 'organization_event/title')[0]} {event_date}, has already happened.")
                continue
            
            # Format the occurrence as an event
            formatted_event = format_stuk_event(organization, event, occurrence)
            
            # If an event was successfully formatted
            if formatted_event:
                # Add event to list
                events.append(formatted_event)
                
                # Console log
                print(f"Retrieved {formatted_event['name']} from stuk")
    
    # Console log
    print(f"Formatted {len(events)} {organization['name']} events from stuk")
    
    # Return list of events
    return events

def format_stuk_event(organization, event, occurrence):
        
    # Create a bouncer link for the event
    bouncer_link = f"https://ob.addreax.com/{organization['stuk_id']}/events/{event['id']}/occur/{occurrence['id']}"
    
    # Get timezone
    stockholm = pytz.timezone("Europe/Stockholm")

    # Parse string as local Stockholm time
    start_date = datetime.strptime(occurrence['start_date'], utils.TIME_FORMAT)
    start_date = stockholm.localize(start_date)
    start_date_string = start_date.strftime("%Y-%m-%d %H:%M")

    end_date = datetime.strptime(occurrence['end_date'], utils.TIME_FORMAT)
    end_date = stockholm.localize(end_date)
    end_date_string = end_date.strftime("%Y-%m-%d %H:%M")
    
    # Get address
    address = occurrence['address']
    if not address:
        address = organization['address']
        
    # Get coordinates
    (latitude, longitude) = utils.address_to_coordinates(address)
    
    # Create a formatted event
    formatted_event = {
        "organization_id": organization['id'],
        "organization_name": occurrence['organization_event']['organization']['name'],
        "name": occurrence['organization_event']['title'],
        "description": BeautifulSoup(occurrence['organization_event']['content'], "html.parser").get_text(),
        "address": address,
        "latitude": latitude,
        "longitude": longitude,
        "image": event['image_url'],
        "start_date": start_date_string,
        "end_date": end_date_string,
        "link": bouncer_link
    }
    
    # Return the formatted event
    return formatted_event