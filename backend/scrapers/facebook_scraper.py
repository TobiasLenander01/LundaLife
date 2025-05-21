from bs4 import BeautifulSoup
import requests
import json as json_module
from datetime import datetime

def get_facebook_event(fbid):
    
    # Define URL for the facebook event
    url = f"https://www.facebook.com/events/{fbid}"
    
    # Define headers to mimic a real browser
    headers = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "accept-encoding": "gzip, deflate",
        "accept-language": "en-US,en;q=0.6",
        "cache-control": "max-age=0",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "sec-gpc": "1",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
    }
    
    # Try a GET request
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        html = response.text
    except requests.RequestException as error:
        print(error)
        return None

    # Format respone html text with beautiful soup
    soup = BeautifulSoup(html, 'html.parser')
    
    # Get json data from html
    json = soup_to_json(soup)
    
    # Format event data in a dictionary
    formatted_event = {
        "id": find(json, "params/event_id"),
        "organization_id": find(json, "entity/id"),
        "organization_name": find(json, "entity/short_name"),
        "name": find(json, "meta/title"),
        "description": find(json, "event_description/text"),
        "address": find(json, "event_place/contextual_name"),
        "image": find(json, "full_image/uri"),
        "start_date": str(datetime.fromtimestamp(find(json, "data/start_timestamp"))),
        "end_date": str(datetime.fromtimestamp(find(json, "data/end_timestamp"))),
        "link": find(json, "event/url")
    }
    
    # Return the formatted event dictionary
    return formatted_event
    
    
def soup_to_json(soup):
    # Get all <script> tags
    tags = soup.find_all('script', type='application/json')
    
    # Create an empty dictionary
    json = {}

    # Loop through each tag
    for tag in tags:
        # Parse json from tag
        json_raw = tag.get_text(strip=True)
        json_parsed = json_module.loads(json_raw)
        
        # Loop through each key, value pair in parsed json
        for key, value in json_parsed.items():
            
            # Check if key is already in dictionary
            if key not in json:
                # If it isn't, then add the key value pair
                json[key] = value
            else:
                # If it is, create a new unique key
                i = 1
                new_key = f"{key}_{i}"
                while new_key in json:
                    i += 1
                    new_key = f"{key}_{i}"
                    
                # Add to dictionary
                json[new_key] = value
    
    return json

def find(data, key_path):
    # Split the key_path string into a list of keys
    target_path = key_path.split("/")
    
    # Initialize the result variable to None
    result = None

    # Define a recursive search function
    def search(obj, parents):
        nonlocal result  # Allow modification of result in the outer scope
        if result is not None:
            return  # Stop searching if result is already found

        if isinstance(obj, dict):
            # Iterate through each key-value pair in the dictionary
            for key, value in obj.items():
                # Build the current path of keys
                current_parents = parents + [key]
                # Check if the end of the current path matches the target path
                if len(current_parents) >= len(target_path) and current_parents[-len(target_path):] == target_path:
                    result = value  # Set result if path matches
                    return
                # Recursively search the value
                search(value, current_parents)

        elif isinstance(obj, list):
            # Iterate through each item in the list
            for item in obj:
                # Recursively search each item
                search(item, parents)

    # Start the search with the initial data and an empty parent path
    search(data, [])
    # Return the found result, or None if not found
    return result

event = get_facebook_event(1144572210449522)
print()
print(json_module.dumps(event, indent=4, ensure_ascii=False))