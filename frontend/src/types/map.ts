
/**
 * Defines the types used for custom map markers within the application.
 * This file contains the `CustomMarker` interface, which specifies the structure
 * and optional properties for representing markers on a map, including position,
 * display content, and icon customization.
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