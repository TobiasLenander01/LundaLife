import requests
import json as json_module
from bs4 import BeautifulSoup

TIME_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"

def html_to_json(html):
    # Format respone html text with beautiful soup
    soup = BeautifulSoup(html, 'html.parser')
    
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
    
    # Initialize the result list
    results = []

    # Define a recursive search function
    def search(obj, parents):
        if isinstance(obj, dict):
            for key, value in obj.items():
                current_parents = parents + [key]
                # Check if the end of the current path matches the target path
                if len(current_parents) >= len(target_path) and current_parents[-len(target_path):] == target_path:
                    results.append(value)
                # Recursively search the value
                search(value, current_parents)

        elif isinstance(obj, list):
            for item in obj:
                search(item, parents)

    # Start the search
    search(data, [])
    return results

def get_html(url):
    
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
    
    return html