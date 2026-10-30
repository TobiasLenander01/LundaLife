import type { Event } from '@/types/events';

// All events take place in Lund, so "today", "this week" etc. are always
// evaluated in Swedish time, regardless of the server's or browser's time zone.
export const TIME_ZONE = 'Europe/Stockholm';

// Formats a date as a sortable "YYYY-MM-DD" string in Swedish time
const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

function toDayKey(date: Date): string {
    return dayKeyFormatter.format(date);
}

// Adds days to a "YYYY-MM-DD" key using plain calendar arithmetic
function addDays(dayKey: string, days: number): string {
    const [year, month, day] = dayKey.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

// Checks if an event takes place (at least partly) between two days, inclusive
function overlapsDays(event: Event, firstDay: string, lastDay: string): boolean {
    const startDay = toDayKey(new Date(event.start_date));
    const endDay = event.end_date ? toDayKey(new Date(event.end_date)) : startDay;
    return startDay <= lastDay && endDay >= firstDay;
}

export function isToday(event: Event, now: Date = new Date()): boolean {
    const today = toDayKey(now);
    return overlapsDays(event, today, today);
}

export function isThisWeek(event: Event, now: Date = new Date()): boolean {
    const today = toDayKey(now);

    // Swedish weeks start on Monday (0 = Monday ... 6 = Sunday)
    const [year, month, day] = today.split('-').map(Number);
    const weekday = (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;

    const monday = addDays(today, -weekday);
    const sunday = addDays(monday, 6);
    return overlapsDays(event, monday, sunday);
}

export function isThisMonth(event: Event, now: Date = new Date()): boolean {
    const month = toDayKey(now).slice(0, 7);
    return overlapsDays(event, `${month}-01`, `${month}-31`);
}

// Checks if an event is happening right now
export function isOngoing(event: Event, now: Date = new Date()): boolean {
    const start = new Date(event.start_date);
    const end = new Date(event.end_date ?? event.start_date);
    return start <= now && end >= now;
}

// Returns the day an event is listed under: its start day, or today if it has already started
export function getListDay(event: Event, now: Date = new Date()): string {
    const startDay = toDayKey(new Date(event.start_date));
    const today = toDayKey(now);
    return startDay < today ? today : startDay;
}

// Formats a "YYYY-MM-DD" key as "Today", "Tomorrow" or e.g. "Thursday 5 November"
const dayHeadingFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
});

export function formatDayHeading(dayKey: string, now: Date = new Date()): string {
    const today = toDayKey(now);
    if (dayKey === today) return 'Today';
    if (dayKey === addDays(today, 1)) return 'Tomorrow';

    const [year, month, day] = dayKey.split('-').map(Number);
    return dayHeadingFormatter.format(new Date(Date.UTC(year, month - 1, day, 12)));
}

// Formats times in Swedish time, e.g. "20:00" and "6 Nov 20:00"
const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
});

// Formats an event's time span, e.g. "20:00 – 01:00", or with dates if it lasts more than a day
export function formatTimeRange(event: Event): string {
    const start = new Date(event.start_date);
    if (!event.end_date) {
        return timeFormatter.format(start);
    }

    const end = new Date(event.end_date);
    const lastsOverADay = end.getTime() - start.getTime() >= 24 * 60 * 60 * 1000;
    const format = lastsOverADay ? dateTimeFormatter : timeFormatter;
    return `${format.format(start)} – ${format.format(end)}`;
}
