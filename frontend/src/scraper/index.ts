
/*
 * Scrapes upcoming events for all organizations from Stuk and Facebook and saves them to the database.
 */

import { getOrganizations, upsertEvent } from '@/database/database';
import { ScrapedEvent, ScrapeResult } from '@/types/scraper';
import { getStukEvents } from '@/scraper/stuk';
import { getFacebookEvents } from '@/scraper/facebook';
import { mapWithConcurrency } from '@/scraper/utils';

// Number of organizations scraped at the same time
const CONCURRENCY = 4;

export async function scrapeEvents({ dryRun = false } = {}): Promise<ScrapeResult> {
  const startTime = Date.now();

  // Load organizations from database
  const organizations = await getOrganizations();

  // Scrape each organization's events from both sources
  const results = await mapWithConcurrency(organizations, CONCURRENCY, async (organization) => {
    const [stuk, facebook] = await Promise.all([
      getStukEvents(organization),
      getFacebookEvents(organization),
    ]);
    return { stuk, facebook };
  });

  const stukEvents = results.flatMap(result => result.stuk);
  const facebookEvents = results.flatMap(result => result.facebook);

  console.log(`Scraped ${stukEvents.length} events from stuk and ${facebookEvents.length} from facebook`);

  const result: ScrapeResult = {
    dryRun,
    durationMs: 0,
    scraped: { stuk: stukEvents.length, facebook: facebookEvents.length },
    saved: { stuk: 0, facebook: 0 },
  };

  if (dryRun) {
    result.events = [...stukEvents, ...facebookEvents];
  } else {
    // Save stuk events first, so facebook events at the same time take precedence (matching the unique constraint)
    const save = async (events: ScrapedEvent[]) => {
      let saved = 0;
      for (const event of events) {
        if (await upsertEvent(event)) {
          saved++;
        }
      }
      return saved;
    };

    result.saved.stuk = await save(stukEvents);
    result.saved.facebook = await save(facebookEvents);

    console.log(`Saved ${result.saved.stuk} stuk events and ${result.saved.facebook} facebook events`);
  }

  result.durationMs = Date.now() - startTime;
  return result;
}
