import requests
from bs4 import BeautifulSoup
import datetime

def get_stuk_events(organizations):
    '''
    Fetches events from STUK API and formats them for database insertion.
    '''
    
    # Create an empty list to store formatted events
    formatted_events = []
    
    # Loop through each organization
    for organization in organizations:
        
        # Check if organization has a stuk_id
        if organization.get("stuk_id") is None:
            print(f"{organization.get("name")} has no stuk_id, skipping.")
            continue
        
        # Define the URL for the STUK API
        URL = f"https://api.studentkortet.se/organization/{organization['stuk_id']}/organization-events"
        
        # Make a GET request
        response = requests.get(URL)
        
        # Check if the request was successful
        if response.status_code != 200:
            # Print error message
            print(f"Failed to fetch data for {organization['name']}, status code {response.status_code}")
            return None
        
        # Save the response data as JSON
        print(f"Request successful, status code {response.status_code}")
        event_data = response.json()

        # Check if there is event data
        if event_data is None:
            print(f"No event data was given")
            return []

        # Loop through each event in the event data
        for event in event_data:
            print("Fetching: " + event.get("title"))
            
            # Get event details
            event_title = event.get("title")
            event_description = event.get("content")

            # Get each event occurrence
            occurrences = event.get("organization_event_occurrences", [])

            # Loop through each occurrence
            for occurrence in occurrences:
                
                # Create an empty list to store formatted tickets
                formatted_tickets = []

                # Get ticket data from the occurrence
                ticket_data = occurrence.get("tickets", [])

                # Check if there are tickets available
                if ticket_data:
                    print("Tickets found for event: " + event_title)
                    
                    # Loop through each ticket
                    for ticket in ticket_data:
                        
                        # Remove trailing zeros
                        if ticket.get("price") is not None:
                            price = ticket.get("price") / 100
                        
                        # Format the ticket data
                        formatted_ticket = {
                            "name": ticket.get("name"),
                            "ticket_count": ticket.get("count"),
                            "price": price,
                            "active": ticket.get("is_active"),
                            "max_count_per_person": ticket.get("max_count_per_member")
                        }

                        # Add the formatted ticket to the list
                        formatted_tickets.append(formatted_ticket)
                else:
                    print("No tickets found for event: " + event_title)

                # Create a bouncer link for the event
                bouncer_link = f"https://ob.addreax.com/{organization['stuk_id']}/events/{occurrence.get('organization_event_id')}/occur/{occurrence.get('id')}"
                
                # Combine IDs
                event_id = occurrence.get("organization_event_id")
                occurrence_id = occurrence.get("id")
                combined_id = f"{event_id}{occurrence_id}"
                
                # Check if there is an address in the event
                address = occurrence.get("address")
                if not address:
                    # If no address, use the organization's address
                    address = organization['address']

                # Create a formatted event dictionary
                formatted_event = {
                    "id": combined_id,
                    "organization_id": organization['stuk_id'],
                    "organization_name": organization['name'],
                    "name": event_title,
                    "description": BeautifulSoup(event_description, "html.parser").get_text(),
                    "address": address,
                    "image": event.get("image_url"),
                    "start_date": occurrence.get("start_date"),
                    "end_date": occurrence.get("end_date"),
                    "link": bouncer_link,
                    "tickets": formatted_tickets
                }
                
                # Get the current date and time
                current_datetime = datetime.datetime.now()
                event_start_datetime = datetime.datetime.strptime(occurrence.get("start_date"), "%Y-%m-%dT%H:%M:%S.%fZ")
                
                # Check if the event has already happened
                if event_start_datetime < current_datetime:
                    print(f"Skipping {event_title}, has already happened.")
                    continue
                
                # Add the formatted event to the list
                print("Adding event to list: " + event_title)
                formatted_events.append(formatted_event)
                
    # Return the list of formatted events
    print(f"Returning {len(formatted_events)} events from STUK API")
    return formatted_events