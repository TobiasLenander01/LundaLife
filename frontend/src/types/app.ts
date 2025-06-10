
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