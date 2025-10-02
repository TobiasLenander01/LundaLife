/**
 * Helper functions for date filtering
 */

import { Event, FilterOption, Organization } from "@/types/app";

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
 * Filters organizations based on whether they have events matching the selected filter
 * @param organizations - Array of organizations with events
 * @param selectedFilter - The selected filter option
 * @returns Filtered array of organizations
 */
export function filterOrganizations(organizations: Organization[], selectedFilter: FilterOption): Organization[] {
  return organizations.filter(organization => {
    return organization.events?.some(
      event => {
        switch (selectedFilter.value) {
          case 'today':
            return isToday(event.start_date);
          case 'this-week':
            return isThisWeek(event.start_date);
          case 'this-month':
            return isThisMonth(event.start_date);
          default:
            return true;
        }
      }
    );
  });
}

/**
 * Filters events based on the selected filter option
 * @param events - Array of events to filter
 * @param selectedFilter - The selected filter option
 * @returns Filtered array of events
 */
export function filterEvents(events: Event[], selectedFilter: FilterOption): Event[] {
  return events.filter(event => {
    switch (selectedFilter.value) {
      case 'today':
        return isToday(event.start_date);
      case 'this-week':
        return isThisWeek(event.start_date);
      case 'this-month':
        return isThisMonth(event.start_date);
      default:
        return true; // 'all' or unrecognized filter shows all events
    }
  });
}