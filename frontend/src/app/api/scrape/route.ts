import { NextRequest } from 'next/server';
import { scrapeEvents } from '@/scraper';

// Scraping all organizations takes a while, so allow up to 5 minutes
export const maxDuration = 300;

/**
 * Scrapes events and saves them to the database. Called daily by Vercel Cron (see vercel.json).
 * Requires the header "Authorization: Bearer <CRON_SECRET>", which Vercel Cron sends automatically.
 * Add ?dryRun to return the scraped events without saving them.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.has('dryRun');

  try {
    const result = await scrapeEvents({ dryRun });
    return Response.json(result);
  } catch (error) {
    console.error('Scrape failed:', error);
    return Response.json({ error: 'Scrape failed' }, { status: 500 });
  }
}
