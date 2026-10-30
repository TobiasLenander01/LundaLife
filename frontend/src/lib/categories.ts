
/*
 * Sorts events into categories from their title, description and time of day.
 * Stuk has no categories, so these are best guesses from how nations name their events.
 */

import { TIME_ZONE } from '@/lib/helpers';
import type { Event } from '@/types/database';

export type CategoryValue = 'pub' | 'club' | 'lunch' | 'food' | 'sittning' | 'music' | 'games' | 'sport' | 'other';

export interface CategoryOption {
    value: CategoryValue;
    label: string;
}

export const CategoryOptions: CategoryOption[] = [
    { value: 'pub', label: 'Pub' },
    { value: 'club', label: 'Club & party' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'food', label: 'Food' },
    { value: 'sittning', label: 'Sittning' },
    { value: 'music', label: 'Live music' },
    { value: 'games', label: 'Quiz & games' },
    { value: 'sport', label: 'Sport & outdoors' },
    { value: 'other', label: 'Other' },
];

// Swedish and English keywords for each category
const KEYWORDS: [CategoryValue, RegExp][] = [
    ['pub', /pub|\bbar\b|\baw\b|after ?work|källare|vinkväll|\böl\b|cocktail/i],
    ['club', /klubb|(?<!run ?)club|disco|\brave\b|\bdj\b|dansgolv|\bfest\b|festen|party|eftersläpp/i],
    ['lunch', /lunch|brunch/i],
    ['food', /frukost|fika|\bmat\b|restaurang|caf[eé]|kafé|pannkak|våffl|tapas|afternoon tea|middag|dinner|tasting|provning/i],
    ['sittning', /sittning|gasque|\bgask|bankett|\bbal\b|slasque|gåsamiddag/i],
    ['music', /\blive\b|konsert|concert|spelning|\bband\b|jazz|open mic|karaoke|schlager/i],
    ['games', /quiz|bingo|spelkväll|board game|brädspel|turnering|tournament|escape room|\bdart/i],
    ['sport', /sport|fotboll|innebandy|\bgym\b|yoga|löpning|runners|run ?club|padel|bowling|climbing|klättr|aikido|skidresa|\bski\b|hike|vandring/i],
];

// Lunch is roughly 10:30–14:30; late-night events start at 21:00 or later
const LUNCH_START = 10 * 60 + 30;
const LUNCH_END = 14 * 60 + 30;
const NIGHT_START = 21 * 60;

const minutesFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});

// Minutes after midnight in Swedish time
function minutesOfDay(date: Date): number {
    const [hours, minutes] = minutesFormatter.format(date).split(':').map(Number);
    return hours * 60 + minutes;
}

function matchKeywords(text: string): CategoryValue[] {
    return KEYWORDS.filter(([, pattern]) => pattern.test(text)).map(([category]) => category);
}

// Replaces one category with another (without duplicates)
function replace(categories: CategoryValue[], from: CategoryValue, to: CategoryValue): CategoryValue[] {
    const replaced = categories.map((category) => (category === from ? to : category));
    return [...new Set(replaced)];
}

export function getCategories(event: Event): CategoryValue[] {
    const start = new Date(event.start_date);
    const end = event.end_date ? new Date(event.end_date) : null;
    const hours = end ? (end.getTime() - start.getTime()) / 3_600_000 : 0;
    const startMinutes = minutesOfDay(start);

    // A meal at midday, not e.g. a ski trip that happens to leave at noon
    const isLunchTime = startMinutes >= LUNCH_START && startMinutes < LUNCH_END && hours <= 4;

    // The title is the most reliable; descriptions mention many things, so only use them as a fallback
    let categories = matchKeywords(event.name);
    const fromTitle = categories.length > 0;
    if (!fromTitle && event.description) {
        categories = matchKeywords(event.description);
    }

    if (isLunchTime) {
        // Food served at lunch time is lunch
        categories = replace(categories, 'food', 'lunch');
    } else if (!fromTitle) {
        // A description mentioning lunch isn't enough outside lunch time (e.g. a lunchbox workshop)
        categories = replace(categories, 'lunch', 'food');
    }

    // Without keywords, fall back to the time of day
    if (categories.length === 0) {
        if (isLunchTime) {
            categories = ['lunch'];
        } else if (startMinutes >= NIGHT_START && end && minutesOfDay(end) < 6 * 60 && hours <= 8) {
            // Starts late in the evening and goes on past midnight
            categories = ['club'];
        }
    }

    return categories.length > 0 ? categories : ['other'];
}
