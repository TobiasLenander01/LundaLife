
export interface CustomMarker {
    id: string | number;
    lat: number;
    lng: number;
    title?: string;
    content?: string;
    icon?: string | google.maps.Icon | google.maps.Symbol;
}