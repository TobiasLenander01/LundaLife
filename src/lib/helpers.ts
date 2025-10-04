/**
 * Helper functions for date filtering
 */

import { Event, FilterOption, Organization, FilterState } from "@/types/app";

/**
 * Checks if a date string represents today
 * @param dateStr - Date string in ISO format
 * @returns true if the date is today
 */
export function isToday(dateStr: string): boolean {
  if (!dateStr) return false;

  const date = new Date(dateStr);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Checks if a date string represents tomorrow
 * @param dateStr - Date string in ISO format
 * @returns true if the date is tomorrow
 */
export function isTomorrow(dateStr: string): boolean {
  if (!dateStr) return false;

  const date = new Date(dateStr);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()
  );
}

/**
 * Checks if a date string represents a date within this week
 * @param dateStr - Date string in ISO format
 * @returns true if the date is within this week
 */
export function isThisWeek(dateStr: string): boolean {
  if (!dateStr) return false;

  const date = new Date(dateStr);
  const today = new Date();

  // Get the start of this week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Get the end of this week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return date >= startOfWeek && date <= endOfWeek;
}

/**
 * Checks if a date string represents a date within next week
 * @param dateStr - Date string in ISO format
 * @returns true if the date is within next week
 */
export function isNextWeek(dateStr: string): boolean {
  if (!dateStr) return false;

  const date = new Date(dateStr);
  const today = new Date();

  // Get the start of next week (Sunday of next week)
  const startOfNextWeek = new Date(today);
  startOfNextWeek.setDate(today.getDate() - today.getDay() + 7);
  startOfNextWeek.setHours(0, 0, 0, 0);

  // Get the end of next week (Saturday of next week)
  const endOfNextWeek = new Date(startOfNextWeek);
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
  endOfNextWeek.setHours(23, 59, 59, 999);

  return date >= startOfNextWeek && date <= endOfNextWeek;
}

/**
 * Checks if a date string represents a date within this month
 * @param dateStr - Date string in ISO format
 * @returns true if the date is within this month
 */
export function isThisMonth(dateStr: string): boolean {
  if (!dateStr) return false;

  const date = new Date(dateStr);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth()
  );
}

/**
 * Checks if an event matches the category filter
 * @param event - The event to check
 * @param categoryFilter - The category filter to apply
 * @returns true if the event matches the category filter
 */
export function matchesCategoryFilter(event: Event, categoryFilter: FilterOption): boolean {
  if (categoryFilter.value === 'all') return true;

  const eventCategory = event.category?.toLowerCase() || 'other';
  const filterValue = categoryFilter.value.toLowerCase();

  if (filterValue === 'other') {
    // For "other" category, include events with null/undefined category or categories not in our predefined list
    const predefinedCategories = ['breakfast', 'lunch', 'bar', 'club'];
    return eventCategory === 'other' || !predefinedCategories.includes(eventCategory);
  }

  return eventCategory === filterValue;
}

/**
 * Checks if an event matches the date filter
 * @param event - The event to check
 * @param dateFilter - The date filter to apply
 * @returns true if the event matches the date filter
 */
export function matchesDateFilter(event: Event, dateFilter: FilterOption): boolean {
  switch (dateFilter.value) {
    case 'today':
      return isToday(event.start_date);
    case 'tomorrow':
      return isTomorrow(event.start_date);
    case 'this-week':
      return isThisWeek(event.start_date);
    case 'next-week':
      return isNextWeek(event.start_date);
    case 'this-month':
      return isThisMonth(event.start_date);
    default:
      return true; // 'all' or unrecognized filter shows all events
  }
}

/**
 * Filters organizations based on whether they have events matching the selected filters
 * @param organizations - Array of organizations with events
 * @param filterState - The filter state containing both date and category filters
 * @returns Filtered array of organizations
 */
export function filterOrganizations(organizations: Organization[], filterState: FilterState): Organization[] {
  return organizations.filter(organization => {
    return organization.events?.some(event =>
      matchesDateFilter(event, filterState.dateFilter) &&
      matchesCategoryFilter(event, filterState.categoryFilter)
    );
  });
}

/**
 * Filters events based on the selected filter options
 * @param events - Array of events to filter
 * @param filterState - The filter state containing both date and category filters
 * @returns Filtered array of events
 */
export function filterEvents(events: Event[], filterState: FilterState): Event[] {
  return events.filter(event =>
    matchesDateFilter(event, filterState.dateFilter) &&
    matchesCategoryFilter(event, filterState.categoryFilter)
  );
}

export function determineEventCategory(event: Event): string | null {
  // Define categories with keywords
  const categories = [
    { label: "Breakfast", probability: 0, keywords: ['frukost'] },
    { label: "Lunch", probability: 0, keywords: ['lunch', 'brunch', 'food'] },
    { label: "Bar", probability: 0, keywords: ['bar', 'pub'] },
    { label: "Club", probability: 0, keywords: ['klubb', 'disco', 'dj'] }
  ];

  if (event.description) {
    const description = event.description.toLowerCase();
    for (const category of categories) {
      for (const keyword of category.keywords) {
        if (description.includes(keyword)) {
          category.probability++;
        }
      }
    }
  }

  const startHour = new Date(event.start_date).getHours();
  if (startHour == 12) {
    // If the event starts at noon, increase probability for Lunch
    categories.find(category => category.label === "Lunch")!.probability++;
  } else if (startHour >= 18) {
    // If the event starts in the evening, increase probability for Bar and Club
    categories.find(category => category.label === "Bar")!.probability++;
    categories.find(category => category.label === "Club")!.probability++;
  } else if (startHour < 12) {
    // If the event starts in the morning, increase probability for Breakfast
    categories.find(category => category.label === "Breakfast")!.probability++;
  }

  // Set minimum threshold for category assignment
  const MINIMUM_THRESHOLD = 2;

  // Sort categories by probability
  categories.sort((a, b) => b.probability - a.probability);

  // Return the category with the highest probability if above threshold
  if (categories[0].probability >= MINIMUM_THRESHOLD) {
    return categories[0].label;
  } else {
    return 'Other'; // No category assigned
  }
}

/**
 * Fetches HTML content from a URL with browser-like headers
 * @param url - The URL to fetch HTML from
 * @returns Promise that resolves to HTML string or null if error
 */
export async function getHtml(url: string): Promise<string | null> {
  // Define headers to mimic a real browser
  const headers = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "accept-encoding": "gzip, deflate",
    "accept-language": "en-US,en;q=0.6",
    "cache-control": "max-age=0",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "sec-gpc": "1",
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
  };

  // Try a GET request
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    return html;
  } catch (error) {
    console.error(error);
    return null;
  }
}


/**
 * Extracts JSON data from <script type="application/json"> tags in HTML
 * @param html - HTML string to parse
 * @returns Array of parsed JSON objects found in script tags
 */
export function getJsonFromHtml(html: string): unknown[] {
  if (!html || typeof html !== 'string') {
    return [];
  }

  const jsonData: unknown[] = [];
  
  // Regular expression to match <script type="application/json"> tags and their content
  const scriptRegex = /<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi;
  
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const jsonContent = match[1].trim();
    
    if (jsonContent) {
      try {
        const parsedJson = JSON.parse(jsonContent);
        jsonData.push(parsedJson);
      } catch (error) {
        console.warn('Failed to parse JSON from script tag:', error);
        // Optionally, you can still push the raw content if parsing fails
        // jsonData.push({ raw: jsonContent, error: error.message });
      }
    }
  }
  
  return jsonData;
}

/**
 * Recursively searches through a nested object/array structure to find values
 * at paths that match the specified key path pattern
 * @param data - The data structure to search through (object or array)
 * @param keyPath - The path pattern to match, separated by "/" (e.g., "user/profile/name")
 * @returns Array of values found at matching paths
 */
export function jsonFind(data: unknown, keyPath: string): unknown[] {
  // Split the key_path string into a list of keys
  const targetPath = keyPath.split("/");
  
  // Initialize the result list
  const results: unknown[] = [];

  // Define a recursive search function
  function search(obj: unknown, parents: string[]): void {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      // Handle objects
      for (const [key, value] of Object.entries(obj)) {
        const currentParents = [...parents, key];
        
        // Check if the end of the current path matches the target path
        if (currentParents.length >= targetPath.length && 
            currentParents.slice(-targetPath.length).join("/") === keyPath) {
          results.push(value);
        }
        
        // Recursively search the value
        search(value, currentParents);
      }
    } else if (Array.isArray(obj)) {
      // Handle arrays
      for (const item of obj) {
        search(item, parents);
      }
    }
  }

  // Start the search
  search(data, []);
  return results;
}