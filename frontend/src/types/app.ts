
import { ReactNode } from "react";

export interface CustomMarker {
    id: string | number;
    lat: number;
    lng: number;
    title?: string;
    glyph?: ReactNode;
    onClick?: () => void;
}

export interface FilterOption {
  value: string;
  label: string;
}

export const FilterOptions: FilterOption[] = [
  { value: 'today', label: 'Events today' },
  { value: 'this-week', label: 'Events this week' },
  { value: 'this-month', label: 'Events this month' },
  { value: 'all', label: 'All organizations' },
];

export type Organization = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  stuk_id: number | null;
  fb_id?: number | null;
  icon?: string | null;
  events?: Event[];
};

export type Event = {
  id: number;
  organization_id: number;
  name: string;
  description: string | null;
  address: string | null;
  image: string | null;
  link: string | null;
  start_date: string;
  end_date: string | null;
};