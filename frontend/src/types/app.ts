
/*
 * Defines the types used within the application.
 */

export interface CustomMarker {
    id: string | number;
    lat: number;
    lng: number;
    title?: string;
    content?: string;
    icon?: string | google.maps.Icon | google.maps.Symbol;
    onClick?: () => void;
}

export interface FilterOption {
  value: string;
  label: string;
}

export const FilterOptions: FilterOption[] = [
  { value: 'all', label: 'All organizations' },
  { value: 'today', label: 'Events today' },
  { value: 'this-week', label: 'Events this week' },
  { value: 'this-month', label: 'Events this month' },
];