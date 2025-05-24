
export interface CustomMarker {
    id: string | number;
    lat: number;
    lng: number;
    title?: string;
    icon?: string | google.maps.Icon | google.maps.Symbol;
}