
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