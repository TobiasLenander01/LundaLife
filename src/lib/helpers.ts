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