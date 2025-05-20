from bs4 import BeautifulSoup
import requests
from datetime import datetime
from bs4 import BeautifulSoup
from datetime import datetime, timezone
import json
import re

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
        html = response.text
    except requests.RequestException as error:
        print(error)
        return None

    soup = BeautifulSoup(html, 'html.parser')
    
    event = soup_to_json(soup)
    
    print(json.dumps(event, indent=4, ensure_ascii=False))
    
    
def soup_to_json(soup):
    script_tags = soup.find_all('script', type='application/json')

    all_event_json_blobs = []

    for tag in script_tags:
        try:
            raw_json_text = tag.get_text(strip=True)
            if not raw_json_text:
                continue
            
            parsed_script_json = json.loads(raw_json_text)

            if not isinstance(parsed_script_json, dict):
                continue

            if "require" in parsed_script_json and isinstance(parsed_script_json["require"], list):
                for require_item in parsed_script_json["require"]:
                    if isinstance(require_item, list) and len(require_item) >= 4:
                        if require_item[0] == "ScheduledServerJS" and require_item[1] == "handle":
                            scheduled_payloads_list = require_item[3]
                            if isinstance(scheduled_payloads_list, list):
                                for sp_payload_item in scheduled_payloads_list:
                                    if isinstance(sp_payload_item, dict) and "__bbox" in sp_payload_item:
                                        bbox = sp_payload_item.get("__bbox", {})
                                        if isinstance(bbox, dict) and "require" in bbox and isinstance(bbox["require"], list):
                                            for req_call in bbox["require"]:
                                                if isinstance(req_call, list) and len(req_call) >= 4 and \
                                                   req_call[0] == "RelayPrefetchedStreamCache" and req_call[1] == "next":
                                                    
                                                    relay_payload_list = req_call[3]
                                                    if isinstance(relay_payload_list, list) and len(relay_payload_list) >= 2:
                                                        data_container = relay_payload_list[1]
                                                        if isinstance(data_container, dict) and "__bbox" in data_container:
                                                            inner_bbox = data_container.get("__bbox", {})
                                                            if isinstance(inner_bbox, dict) and "result" in inner_bbox and \
                                                               isinstance(inner_bbox["result"], dict) and "data" in inner_bbox["result"] and \
                                                               isinstance(inner_bbox["result"]["data"], dict):
                                                                
                                                                data_payload = inner_bbox["result"]["data"]
                                                                event_candidate = data_payload.get("event")
                                                                if event_candidate and isinstance(event_candidate, dict) and "id" in event_candidate:
                                                                    all_event_json_blobs.append(event_candidate)
                                                                
                                                                node_candidate = data_payload.get("node")
                                                                if node_candidate and isinstance(node_candidate, dict) and \
                                                                   "id" in node_candidate and node_candidate.get("__typename") == "Event":
                                                                    all_event_json_blobs.append(node_candidate)
                        elif require_item[0] == "RelayPrefetchedStreamCache" and require_item[1] == "next":
                            relay_payload_list = require_item[3]
                            if isinstance(relay_payload_list, list) and len(relay_payload_list) >= 2:
                                data_container = relay_payload_list[1]
                                if isinstance(data_container, dict) and "__bbox" in data_container:
                                    inner_bbox = data_container.get("__bbox", {})
                                    if isinstance(inner_bbox, dict) and "result" in inner_bbox and \
                                        isinstance(inner_bbox["result"], dict) and "data" in inner_bbox["result"] and \
                                        isinstance(inner_bbox["result"]["data"], dict):
                                        data_payload = inner_bbox["result"]["data"]
                                        event_candidate = data_payload.get("event")
                                        if event_candidate and isinstance(event_candidate, dict) and "id" in event_candidate:
                                            all_event_json_blobs.append(event_candidate)
                                        node_candidate = data_payload.get("node")
                                        if node_candidate and isinstance(node_candidate, dict) and \
                                            "id" in node_candidate and node_candidate.get("__typename") == "Event":
                                            all_event_json_blobs.append(node_candidate)
        except json.JSONDecodeError:
            continue
        except Exception:
            continue
            
    if not all_event_json_blobs:
        print(json.dumps({}, indent=4, ensure_ascii=False))
        return {}

    target_event_id = None
    canonical_link_tag = soup.find("link", rel="canonical")
    if canonical_link_tag and canonical_link_tag.get("href"):
        match = re.search(r'/(\d+)/?$', canonical_link_tag.get("href"))
        if match:
            target_event_id = match.group(1)
    
    if not target_event_id:
        for blob in all_event_json_blobs:
            if "start_timestamp" in blob and blob.get("__typename") == "Event":
                target_event_id = blob.get("id")
                break
        if not target_event_id and all_event_json_blobs:
             target_event_id = all_event_json_blobs[0].get("id")

    base_event_data = None
    event_full_description = None
    organization_name_from_creator = None
    
    for blob in all_event_json_blobs:
        if blob.get("id") == target_event_id:
            if ("cover_media_renderer" in blob or "event_place" in blob) and \
               not ("event_description" in blob and isinstance(blob.get("event_description"), dict) and "text" in blob.get("event_description")):
                if base_event_data is None:
                     base_event_data = blob

            if base_event_data is None:
                base_event_data = blob

            desc_obj = blob.get("event_description")
            if isinstance(desc_obj, dict) and desc_obj.get("text"):
                event_full_description = desc_obj.get("text")
            
            creator_obj = blob.get("event_creator")
            if isinstance(creator_obj, dict) and creator_obj.get("name"):
                organization_name_from_creator = creator_obj.get("name")
            
            if not organization_name_from_creator:
                hosts = blob.get("event_hosts_that_can_view_guestlist")
                if isinstance(hosts, list) and len(hosts) > 0 and isinstance(hosts[0], dict):
                    organization_name_from_creator = hosts[0].get("name")

    if not base_event_data:
        for blob in all_event_json_blobs:
            if blob.get("id") == target_event_id and "start_timestamp" in blob:
                base_event_data = blob
                break 
    
    if not base_event_data:
        for blob in all_event_json_blobs:
            if "id" in blob and "name" in blob and "start_timestamp" in blob:
                base_event_data = blob
                if not event_full_description:
                    desc_obj = base_event_data.get("event_description")
                    if isinstance(desc_obj, dict) and desc_obj.get("text"):
                        event_full_description = desc_obj.get("text")
                if not organization_name_from_creator:
                    creator_obj = base_event_data.get("event_creator")
                    if isinstance(creator_obj, dict) and creator_obj.get("name"):
                        organization_name_from_creator = creator_obj.get("name")
                break
                
    if not base_event_data:
        print(json.dumps({}, indent=4, ensure_ascii=False))
        return {}

    event = {}
    event_id_val = base_event_data.get("id")
    event_name_val = base_event_data.get("name")

    event["id"] = event_id_val
    event["organization_name"] = organization_name_from_creator if organization_name_from_creator else event_name_val
    event["name"] = event_name_val
    event["description"] = event_full_description if event_full_description else base_event_data.get("day_time_sentence")
    
    event_place_data = base_event_data.get("event_place", {})
    event["address"] = event_place_data.get("name") if isinstance(event_place_data, dict) else None
    
    image_uri = None
    cover_media_data = base_event_data.get("cover_media_renderer", {})
    if isinstance(cover_media_data, dict):
        cover_photo_data = cover_media_data.get("cover_photo", {})
        if isinstance(cover_photo_data, dict):
            photo_data = cover_photo_data.get("photo", {})
            if isinstance(photo_data, dict):
                full_image_data = photo_data.get("full_image", {})
                if isinstance(full_image_data, dict):
                    image_uri = full_image_data.get("uri")
    event["image"] = image_uri

    start_ts_val = base_event_data.get("start_timestamp")
    # --- MODIFIED LINE for start_date ---
    event["start_date"] = datetime.fromtimestamp(start_ts_val, timezone.utc).isoformat() if start_ts_val else None
    
    end_ts_val = None
    siblings_data = base_event_data.get("comet_neighboring_siblings")
    if isinstance(siblings_data, list) and len(siblings_data) > 0:
        first_sibling_data = siblings_data[0]
        if isinstance(first_sibling_data, dict):
            end_ts_val = first_sibling_data.get("end_timestamp")
    # --- MODIFIED LINE for end_date ---
    event["end_date"] = datetime.fromtimestamp(end_ts_val, timezone.utc).isoformat() if end_ts_val else None
    
    event["link"] = f"https://www.facebook.com/events/{event_id_val}" if event_id_val else None

    final_output = {key: event.get(key) for key in ["id", "organization_name", "name", "description", "address", "image", "start_date", "end_date", "link"]}
    
    return final_output


get_facebook_event(1144572210449522)