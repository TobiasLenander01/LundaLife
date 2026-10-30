
/*
 * Shared helpers for the event scrapers: HTTP requests, JSON search,
 * HTML parsing, geocoding and Swedish time conversion.
 */

import { TIME_ZONE } from '@/lib/helpers';

// Timeout in milliseconds for all HTTP requests
const REQUEST_TIMEOUT = 30_000;

// Headers to mimic a real browser
const BROWSER_HEADERS = {
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.6',
  'cache-control': 'max-age=0',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-user': '?1',
  'sec-gpc': '1',
  'upgrade-insecure-requests': '1',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
};

// GET a URL and return the response body, or null if the request fails
async function get(url: string, parse: 'text' | 'json', headers?: HeadersInit): Promise<unknown> {
  try {
    const response = await fetch(url, {
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return parse === 'json' ? await response.json() : await response.text();
  } catch (error) {
    console.error(`GET ${url} failed:`, error);
    return null;
  }
}

export async function getHtml(url: string): Promise<string | null> {
  return (await get(url, 'text', BROWSER_HEADERS)) as string | null;
}

export async function getJson(url: string): Promise<unknown> {
  return get(url, 'json');
}

// Parses all <script type="application/json"> tags in an HTML page
export function htmlToJson(html: string): unknown[] {
  const results: unknown[] = [];
  const scriptTags = html.matchAll(/<script\b[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g);

  for (const [, content] of scriptTags) {
    try {
      results.push(JSON.parse(content));
    } catch {
      // Skip tags that don't contain valid JSON
    }
  }

  return results;
}

/**
 * Recursively finds all values whose key path ends with the given path,
 * e.g. find(data, "location/latitude") matches { location: { latitude: 1 } } at any depth.
 */
export function find(data: unknown, keyPath: string): unknown[] {
  const targetPath = keyPath.split('/');
  const results: unknown[] = [];

  const search = (value: unknown, parents: string[]) => {
    if (Array.isArray(value)) {
      value.forEach(item => search(item, parents));
    } else if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) {
        const currentParents = [...parents, key];

        // Check if the end of the current path matches the target path
        if (currentParents.length >= targetPath.length &&
          targetPath.every((part, i) => part === currentParents[currentParents.length - targetPath.length + i])) {
          results.push(child);
        }

        search(child, currentParents);
      }
    }
  };

  search(data, []);
  return results;
}

// Returns the first match of find() if it has the expected type
export function findFirst<T extends 'string' | 'number' | 'object'>(data: unknown, keyPath: string, type: T) {
  const value = find(data, keyPath).find(match => typeof match === type && match !== null);
  return value as (T extends 'string' ? string : T extends 'number' ? number : Record<string, unknown>) | undefined;
}

// Converts an HTML snippet to plain text
export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Returns [latitude, longitude] for an address, or null if geocoding fails
export async function addressToCoordinates(address: string): Promise<[number, number] | null> {
  const apiKey = process.env.GEOCODE_API_KEY;
  if (!apiKey) {
    console.error('GEOCODE_API_KEY is not set');
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  const json = await getJson(url);

  const latitude = findFirst(json, 'location/lat', 'number');
  const longitude = findFirst(json, 'location/lng', 'number');

  if (latitude === undefined || longitude === undefined) {
    console.error(`Geocoding failed for address '${address}'`);
    return null;
  }

  return [latitude, longitude];
}

// Reads the UTC offset of Swedish time at a given moment
const offsetFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
});

function stockholmOffsetMs(timestamp: number): number {
  const parts = Object.fromEntries(offsetFormatter.formatToParts(new Date(timestamp)).map(part => [part.type, Number(part.value)]));
  const wallClockAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return wallClockAsUtc - Math.floor(timestamp / 1000) * 1000;
}

/**
 * Parses an ISO date string such as "2026-11-06T20:00:00.000Z" as Swedish local time, optionally adding days.
 * Note: Stuk marks its dates with "Z" (UTC) but they are actually Swedish wall-clock times.
 */
export function parseStockholmTime(dateString: string, addDays = 0): Date {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) {
    throw new Error(`Invalid date: ${dateString}`);
  }

  const [year, month, day, hour, minute, second] = match.slice(1).map(part => Number(part ?? 0));
  const wallClockAsUtc = Date.UTC(year, month - 1, day + addDays, hour, minute, second);

  // Subtract the offset, then recheck it at the resulting moment in case it crosses a DST change
  const guess = wallClockAsUtc - stockholmOffsetMs(wallClockAsUtc);
  return new Date(wallClockAsUtc - stockholmOffsetMs(guess));
}

// Runs an async function over items with at most `limit` running at once
export async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
