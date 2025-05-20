import requests
import html_to_json
import json

def get_facebook_event(fbid):
    # Define URL for the facebook event
    URL = f"https://www.facebook.com/events/{fbid}"
    
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
        response = requests.get(URL, headers=headers)
        response.raise_for_status()
    except requests.RequestException as error:
        print(error)
        return None

    # Convert respone text to html
    event_html = response.text

    # Convert html to json
    output_json = html_to_json.convert(event_html)

    # Extract meta tags
    try:
        # Get all meta tags from json
        meta_tags = output_json['html'][0]['head'][0]['meta']
        
        # Initialize an empty dictionary to store meta tag key-value pairs
        meta_dict = {}
        
        # Loop through each meta tag found in the HTML
        for tag in meta_tags:
            
            # Get the attributes dictionary for the current meta tag
            attrs = tag.get('_attributes', {})
            
            # Prefer 'property' (Open Graph tags), fallback to 'name' if 'property' is not present
            key = attrs.get('property') or attrs.get('name')
            
             # Only Store the content value in the dictionary with the key if key exists and 'content' attribute is present
            if key and 'content' in attrs:
                meta_dict[key] = attrs['content']
                print(f"{key}: {attrs['content']}")

        # print(meta_dict)

        # Extract desired fields
        formatted_event = {
            "id": fbid,
            "organization_id": None,
            "organization_name": meta_dict.get("og:site_name"),
            "name": meta_dict.get("og:title"),
            "description": meta_dict.get("og:description"),
            "address": meta_dict.get("place:location:street-address"),
            "image": meta_dict.get("og:image"),
            "start_date": meta_dict.get("event:start_time"),
            "end_date": meta_dict.get("event:end_time"),
            "link": meta_dict.get("og:url"),
        }
        
        # Return data
        return formatted_event
    except Exception as e:
        print("Could not extract event data from facebook event:", e)
        return None

event = get_facebook_event(1144572210449522)
print(event)