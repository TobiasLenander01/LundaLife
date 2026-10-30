
/*
 * Scrapes events from Stuk (studentkortet.se), which most nations use for tickets and events.
 */

import { Organization } from '@/types/database';
import { ScrapedEvent } from '@/types/scraper';
import { addressToCoordinates, getJson, htmlToText, parseStockholmTime } from '@/scraper/utils';

type StukOccurrence = {
  id: number;
  start_date: string;
  end_date: string | null;
  address: string | null;
  organization_event: {
    title: string;
    content: string | null;
  };
};

type StukEvent = {
  id: number;
  image_url: string | null;
  organization_event_occurrences: StukOccurrence[];
};

// Returns timezone-aware start and end dates for an occurrence
function getOccurrenceDates(occurrence: StukOccurrence): [Date, Date | null] {
  const startDate = parseStockholmTime(occurrence.start_date);
  let endDate = occurrence.end_date ? parseStockholmTime(occurrence.end_date) : null;

  // Events ending at midnight are sometimes stored with the start day, e.g. 18:00 - 00:00
  if (endDate && occurrence.end_date && endDate <= startDate) {
    endDate = parseStockholmTime(occurrence.end_date, 1);
  }

  return [startDate, endDate];
}

export async function getStukEvents(organization: Organization): Promise<ScrapedEvent[]> {

  // Check if organization has a stuk_id
  if (!organization.stuk_id) {
    console.log(`${organization.name} has no stuk_id, skipping.`);
    return [];
  }

  // Get request
  const url = `https://api.studentkortet.se/organization/${organization.stuk_id}/organization-events`;
  const json = await getJson(url);

  if (!Array.isArray(json)) {
    console.error(`Stuk GET request for ${organization.name} failed`);
    return [];
  }

  const now = new Date();
  const events: ScrapedEvent[] = [];

  // Cache coordinates so each address is only geocoded once
  const coordinatesCache = new Map<string, Promise<[number, number] | null>>();

  for (const event of json as StukEvent[]) {
    for (const occurrence of event.organization_event_occurrences ?? []) {
      try {
        const [startDate, endDate] = getOccurrenceDates(occurrence);

        // Check if the event has already ended
        if ((endDate ?? startDate) < now) {
          continue;
        }

        // Get address and coordinates, falling back to the organization's
        let address = organization.address;
        let latitude: number | null = organization.latitude;
        let longitude: number | null = organization.longitude;

        if (occurrence.address) {
          address = occurrence.address;
          if (!coordinatesCache.has(address)) {
            coordinatesCache.set(address, addressToCoordinates(address));
          }
          [latitude, longitude] = (await coordinatesCache.get(address)) ?? [null, null];
        }

        events.push({
          source: 'stuk',
          organization_id: organization.id,
          name: occurrence.organization_event.title,
          description: htmlToText(occurrence.organization_event.content ?? ''),
          address,
          latitude,
          longitude,
          image: event.image_url,
          start_date: startDate,
          end_date: endDate,
          // Bouncer link for the event
          link: `https://ob.addreax.com/${organization.stuk_id}/events/${event.id}/occur/${occurrence.id}`,
        });
      } catch (error) {
        console.error(`Failed to format stuk occurrence ${occurrence.id} for ${organization.name}:`, error);
      }
    }
  }

  console.log(`Found ${events.length} ${organization.name} events on stuk`);
  return events;
}
