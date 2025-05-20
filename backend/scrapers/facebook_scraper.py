from bs4 import BeautifulSoup
import requests
import json as json_module

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
    
    # Convert html to json
    json = soup_to_json(soup)
    
    # Find event from json data
    event = find_event_recursively(json)
    
    # Save data to files
    with open("soup.html", "w", encoding="utf-8") as f:
        f.write(soup.prettify())
    with open("data.json", "w", encoding="utf-8") as f:
        json_module.dump(json, f, ensure_ascii=False, indent=4)
    with open("event.json", "w", encoding="utf-8") as f:
        json_module.dump(json, f, ensure_ascii=False, indent=4)
    
    # Format event data in a dictionary
    formatted_event = {
        "id": event["id"],
        "organization_id": event["event_creator"]["id"],
        "organization_name": event["event_creator"]["name"],
        "name": soup.title.string if soup.title else "Event",
        "description": event["event_description"]["text"],
        "address": event["event_place"]["contextual_name"],
        "image": soup.find("meta", property="og:image").get("content"),
        "start_date": None,
        "end_date": None,
        "link": url
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

    
def find_event_recursively(data_node):
    """
    Recursively searches for a dictionary that looks like the event data.
    It identifies the event data by checking for the presence of specific
    keys common to the event structure.
    """
    if isinstance(data_node, dict):
        identifying_keys = {'event_kind', 'id', 'event_description', 'is_online', 'event_place'}
        if identifying_keys.issubset(data_node.keys()):
            if (isinstance(data_node.get('id'), str) and
                isinstance(data_node.get('is_online'), bool) and
                isinstance(data_node.get('event_description'), dict) and
                isinstance(data_node.get('event_place'), dict)
                ):
                return data_node

        
        for key, value in data_node.items():
            found_event = find_event_recursively(value)
            if found_event:
                return found_event
                
    elif isinstance(data_node, list):
        for item in data_node:
            found_event = find_event_recursively(item)
            if found_event:
                return found_event
            
    return None

event = get_facebook_event(1144572210449522)
print()
print(json_module.dumps(event, indent=4, ensure_ascii=False))