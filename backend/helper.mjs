import { scrapeFbEvent } from 'facebook-event-scraper';

const input = process.argv[2]; 

// Scrape event using URL
async function get_facebook_event(url) {
  try {
    const eventData = await scrapeFbEvent(url);
    console.log(JSON.stringify(eventData));
  } catch (err) {
    console.error("ERROR:", err.message);
    process.exit(1);
  }
}

get_facebook_event(input);
