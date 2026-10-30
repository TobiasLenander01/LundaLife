
/*
 * Scrapes events from the public Facebook pages of each organization.
 * Facebook embeds its page data as JSON in <script> tags, which is searched by key path.
 */

import { Organization } from '@/types/database';
import { ScrapedEvent } from '@/types/scraper';
import { find, findFirst, getHtml, htmlToJson } from '@/scraper/utils';

export async function getFacebookEvents(organization: Organization): Promise<ScrapedEvent[]> {

  // Check if organization has a fb_id
  if (!organization.fb_id) {
    console.log(`${organization.name} has no fb_id, skipping.`);
    return [];
  }

  // Get the organization's events page
  const html = await getHtml(`https://www.facebook.com/${organization.fb_id}/events`);
  if (!html) {
    console.error(`Facebook GET request for ${organization.name} failed`);
    return [];
  }

  // Find events, each with its own id and whether it has already happened
  const fbEvents = find(htmlToJson(html), 'actions_renderer/event') as { id?: string; is_past?: boolean }[];

  // Skip duplicates and events that have already happened
  const eventIds = new Set(fbEvents.filter(fbEvent => fbEvent?.id && !fbEvent.is_past).map(fbEvent => fbEvent.id!));

  const now = new Date();
  const events: ScrapedEvent[] = [];

  // Fetch the events one at a time to avoid being rate limited
  for (const fbEventId of eventIds) {
    const event = await getFacebookEvent(organization, fbEventId);

    // Check if the event has already ended
    if (event && (event.end_date ?? event.start_date) >= now) {
      events.push(event);
    }
  }

  console.log(`Found ${events.length} ${organization.name} events on facebook`);
  return events;
}

async function getFacebookEvent(organization: Organization, fbEventId: string): Promise<ScrapedEvent | null> {

  // Get the event page
  const html = await getHtml(`https://www.facebook.com/events/${fbEventId}`);
  if (!html) {
    return null;
  }

  const json = htmlToJson(html);

  // Timestamps are in seconds (UTC). Events without an end time have no (or a zero) end timestamp
  const startTimestamp = findFirst(json, 'data/start_timestamp', 'number');
  const endTimestamp = findFirst(json, 'data/end_timestamp', 'number');
  const name = findFirst(json, 'meta/title', 'string');

  if (!startTimestamp || !name) {
    console.error(`Failed to get all values for facebook event ${fbEventId}, skipping.`);
    return null;
  }

  return {
    source: 'facebook',
    organization_id: organization.id,
    name,
    description: findFirst(json, 'event_description/text', 'string') ?? null,
    address: findFirst(json, 'event_place/contextual_name', 'string') || organization.address,
    latitude: findFirst(json, 'location/latitude', 'number') ?? organization.latitude,
    longitude: findFirst(json, 'location/longitude', 'number') ?? organization.longitude,
    image: findFirst(json, 'full_image/uri', 'string') ?? null,
    start_date: new Date(startTimestamp * 1000),
    end_date: endTimestamp ? new Date(endTimestamp * 1000) : null,
    link: findFirst(json, 'event/url', 'string') ?? `https://www.facebook.com/events/${fbEventId}`,
  };
}
