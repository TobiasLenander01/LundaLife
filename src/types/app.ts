
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

export interface DateFilterOption {
  value: string;
  label: string;
}

export interface Category {
  value: string;
  label: string;
  icon?: ReactNode;
  keywords?: string[];
}

export interface FilterState {
  dateFilter: DateFilterOption;
  categoryFilter: Category;
}

export interface Organization {
  id: number,
  stuk_id?: number | null;
  fb_id?: number | null;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
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