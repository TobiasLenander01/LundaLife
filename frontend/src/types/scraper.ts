
/**
 * Defines TypeScript types used by the event scrapers.
 */

import { Event } from '@/types/database';

// An event as returned by a scraper, before it is stored in the database
export type ScrapedEvent = Omit<Event, 'id' | 'start_date' | 'end_date'> & {
  source: 'stuk' | 'facebook';
  start_date: Date;
  end_date: Date | null;
};

export type ScrapeResult = {
  dryRun: boolean;
  durationMs: number;
  scraped: { stuk: number; facebook: number };
  saved: { stuk: number; facebook: number };
  events?: ScrapedEvent[];
};
