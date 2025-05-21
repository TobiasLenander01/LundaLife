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
    
    # Find relevant data in json
    # event_data = find(json, ["start_timestamp", "end_timestamp", "cover_media_renderer", "title", "event_description", "event_place", "event_privacy_info"])
    
    key_paths = [
        "event_description/text",
        "event_place/name",
        "full_image/uri"
    ]
    
    event_data = find_paths(json, key_paths)
    
    print(event_data)
    
    # Save to files
    with open(f"facebook_event_{fbid}_raw.json", "w", encoding="utf-8") as f:
        json_module.dump(json, f, ensure_ascii=False, indent=4)
    with open(f"facebook_event_{fbid}_event.json", "w", encoding="utf-8") as f:
        json_module.dump(event_data, f, ensure_ascii=False, indent=4)
    
    # Format event data in a dictionary
    formatted_event = {
        "id": fbid,
        # "organization_id": event_data["event_privacy_info"]["title"]["ranges"][0]["entity"]["id"],
        # "organization_name": event_data["event_privacy_info"]["title"]["ranges"][0]["entity"]["short_name"],
        # "name": event_data["title"],
        # "description": event_data["event_description"]["text"],
        # "address": event_data["event_place"]["name"],
        # "image": event_data["cover_media_renderer"]["cover_photo"]["photo"]["full_image"]["uri"],
        # "start_date": str(datetime.fromtimestamp(event_data["start_timestamp"])),
        # "end_date": str(datetime.fromtimestamp(event_data["end_timestamp"])),
        # "link": url
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

def find_paths(data, key_paths):
    results = {}
    target_paths = [tuple(path.split("/")) for path in key_paths]
    found_paths = set()

    def search(obj, parents):
        if len(found_paths) == len(target_paths):
            return  # All paths found

        if isinstance(obj, dict):
            for key, value in obj.items():
                current_parents = parents + [key]
                for path in target_paths:
                    if path in found_paths:
                        continue
                    if len(current_parents) >= 2 and tuple(current_parents[-2:]) == path:
                        results["/".join(path)] = value
                        found_paths.add(path)
                search(value, current_parents)

        elif isinstance(obj, list):
            for item in obj:
                search(item, parents)

    search(data, [])
    return results

def find(json, target_keys):
    found = {}
    target_keys_set = set(target_keys)

    def search(obj):
        if len(found) == len(target_keys_set):
            return  # Stop if all keys have been found

        if isinstance(obj, dict):
            for key, value in obj.items():
                if key in target_keys_set and key not in found:
                    found[key] = value
                search(value)
        elif isinstance(obj, list):
            for item in obj:
                search(item)

    search(json)
    return found

event = get_facebook_event(1144572210449522)
print()
print(json_module.dumps(event, indent=4, ensure_ascii=False))