
import { ReactNode } from "react";

export interface CustomMarker {
  id: string | number;
  lat: number;
  lng: number;
  title?: string;
  icon?: string;
  glyph?: ReactNode;
  onClick?: () => void;
}

export interface FilterOption {
  value: string;
  label: string;
}

export const DateFilterOptions: FilterOption[] = [
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This Week' },
  { value: 'next-week', label: 'Next Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

export const CategoryFilterOptions: FilterOption[] = [
  { value: 'all', label: 'All Events' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'bar', label: 'Bar' },
  { value: 'club', label: 'Club' },
  { value: 'other', label: 'Other' },
];

export interface FilterState {
  dateFilter: FilterOption;
  categoryFilter: FilterOption;
}

export interface Organization {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  stuk_id: number;
  fb_id?: number | null;
  icon?: string | null;
  events?: Event[];
};

export interface Event {
  id: string | number;  // Allow both string and number to support composite keys
  name: string;
  description: string | null;
  address: string | null;
  category: string | null;
  image: string | null;
  link: string | null;
  start_date: string;
  end_date: string | null;
};

// Types for the STUK API response
export interface StukEventOccurrence {
  start_date: string;
  end_date?: string | null;
  street_address?: string | null;
  zip_code?: string | null;
  city?: string | null;
  deep_link?: string | null;
}

export interface StukEventData {
  id: number;
  title?: string | null;
  content?: string | null;
  image_url?: string | null;
  url?: string | null;
  organization_event_occurrences?: StukEventOccurrence[];
}