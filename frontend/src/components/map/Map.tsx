'use client';

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { CustomMarker } from '@/types/map';

interface MapComponentProps {
    markers?: CustomMarker[];
    center?: { lat: number; lng: number }
}

export default function MapComponent({
    markers = [],
    center = { lat: 55.7047, lng: 13.1910 }
}: MapComponentProps) {
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.error('Google Maps API Key is not defined');
        return <div>Error: Map cannot be loaded. Missing API Key.</div>;
    }

    const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
    if (!mapId) {
        console.error('Google Maps Map ID is not defined');
        return <div>Error: Map cannot be loaded. Missing Map ID.</div>;
    }

    return (
        <div style={{ height: '100vh', width: '100%' }}> 
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={center}
                    defaultZoom={15}
                    mapId={mapId}
                    disableDefaultUI={true}
                    gestureHandling={'greedy'}
                    backgroundColor={'#000000'}
                >
                    {markers.map((marker, index) => (
                        <AdvancedMarker
                            key={index}
                            position={{ lat: marker.lat, lng: marker.lng }}
                            title={marker.title}
                        />
                    ))}

                </Map>
            </APIProvider>
        </div>
    );
};