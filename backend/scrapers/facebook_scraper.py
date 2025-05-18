import json
import subprocess

def get_facebook_events(organisations):
    for organisation in organisations:
        
        # Check if organization has a fb_id
        if organisation.get("fb_id") is None:
            print(f"{organisation.get("name")} has no fb_id, skipping.")
            continue
        
        try:
            event_url = f"https://www.facebook.com/events/{organisation.get("fb_id")}"
            print(event_url)
            
            result = subprocess.run(
                ['node', 'helper.mjs', event_url],
                capture_output=True,
                text=True,
                check=True
            )
            # Parse the JSON output
            event_data = json.loads(result.stdout)
            return event_data

        except subprocess.CalledProcessError as e:
            print("Node.js script error:", e.stderr)
        except json.JSONDecodeError:
            print("Failed to parse JSON:", result.stdout)