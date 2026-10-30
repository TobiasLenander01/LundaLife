import type { Event } from '@/types/database';

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

// Formats an event date with time in Swedish time, e.g. "6 Nov 2026, 20:00"
const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
});

export function formatDateTime(dateStr: string): string {
    return dateTimeFormatter.format(new Date(dateStr));
}
