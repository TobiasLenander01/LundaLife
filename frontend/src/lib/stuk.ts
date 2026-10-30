
/*
 * Loads events from Stuk (studentkortet.se) directly in the browser.
 * The Stuk API allows cross-origin requests, so no backend is needed.
 */

import { useCallback, useEffect, useState } from 'react';
import { ORGANIZATIONS } from '@/data/organizations';
import { TIME_ZONE } from '@/lib/helpers';
import { Event, Organization } from '@/types/events';

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

// Returns start and end dates for an occurrence
function getOccurrenceDates(occurrence: StukOccurrence): [Date, Date | null] {
  const startDate = parseStockholmTime(occurrence.start_date);
  let endDate = occurrence.end_date ? parseStockholmTime(occurrence.end_date) : null;

  // Events ending at midnight are sometimes stored with the start day, e.g. 18:00 - 00:00
  if (endDate && occurrence.end_date && endDate <= startDate) {
    endDate = parseStockholmTime(occurrence.end_date, 1);
  }

  return [startDate, endDate];
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

// Fetches an organization's upcoming events from Stuk
export async function fetchStukEvents(organization: Organization, signal?: AbortSignal): Promise<Event[]> {
  const url = `https://api.studentkortet.se/organization/${organization.stuk_id}/organization-events`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Stuk request for ${organization.name} failed: ${response.status}`);
  }

  const json = (await response.json()) as StukEvent[];
  const now = new Date();
  const events: Event[] = [];

  // Stuk sometimes lists the same event more than once
  const seen = new Set<string>();

  for (const event of json) {
    for (const occurrence of event.organization_event_occurrences ?? []) {
      try {
        const [startDate, endDate] = getOccurrenceDates(occurrence);

        // Skip events that have already ended
        if ((endDate ?? startDate) < now) {
          continue;
        }

        const name = occurrence.organization_event.title;
        const key = `${startDate.getTime()}|${name}`;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);

        events.push({
          id: occurrence.id,
          organization_id: organization.id,
          name,
          description: htmlToText(occurrence.organization_event.content ?? '') || null,
          address: occurrence.address || organization.address,
          image: event.image_url,
          // Bouncer link for the event
          link: `https://ob.addreax.com/${organization.stuk_id}/events/${event.id}/occur/${occurrence.id}`,
          start_date: startDate.toISOString(),
          end_date: endDate?.toISOString() ?? null,
        });
      } catch (error) {
        console.error(`Failed to read Stuk occurrence ${occurrence.id} for ${organization.name}:`, error);
      }
    }
  }

  return events;
}

type StukState = {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
};

// Loads all organizations with their events from Stuk
export function useStukOrganizations() {
  const [state, setState] = useState<StukState>({ organizations: ORGANIZATIONS, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    // Load all organizations at the same time, and keep the ones that succeed
    Promise.allSettled(ORGANIZATIONS.map((organization) => fetchStukEvents(organization, controller.signal)))
      .then((results) => {
        if (controller.signal.aborted) return;

        const organizations = ORGANIZATIONS.map((organization, i) => {
          const result = results[i];
          if (result.status === 'rejected') {
            console.error(result.reason);
          }
          return { ...organization, events: result.status === 'fulfilled' ? result.value : [] };
        });

        const allFailed = results.every((result) => result.status === 'rejected');
        setState({
          organizations,
          loading: false,
          error: allFailed ? "Couldn't load events from Stuk. Check your connection and try again." : null,
        });
      });

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: null }));
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, retry };
}
