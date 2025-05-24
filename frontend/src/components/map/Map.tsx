'use client';

import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import mapStyle from '@/lib/map/mapStyle.json';
import { CustomMarker } from '@/types/map';

interface MapComponentProps {
    markers?: CustomMarker[];
    center?: { lat: number; lng: number };
    initialZoom?: number;
}

export default function Map ({
    markers = [],
    center = { lat: 55.7047, lng: 13.1910 }, // Default to Lund, Sweden
    initialZoom = 13
}: MapComponentProps) {
    // Load google maps
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
    });

    if (loadError) {
        console.error("Google Maps API load error:", loadError);
        return <div>Failed to load maps. Check the console for details.</div>;
    }
    if (!isLoaded) return <div>Loading Google Maps...</div>;

    return (
        <div className="w-screen h-screen bg-black">
            <GoogleMap
                center={center}
                zoom={initialZoom}
                mapContainerClassName="w-full h-full"
                options={{
                    styles: mapStyle,
                    disableDefaultUI: true,
                    zoomControl: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    backgroundColor: '#000000',
                    gestureHandling: 'greedy',
                }}
            >
                {/* Map over the markers array and render a <Marker> for each */}
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={{ lat: marker.lat, lng: marker.lng }}
                        title={marker.title}
                        icon={marker.icon}
                        onClick={() => console.log(`Marker ${marker.id} clicked!`)}
                    />
                ))}
            </GoogleMap>
        </div>
    );
};