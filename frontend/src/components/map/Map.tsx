'use client';

import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { useMemo } from 'react';
import mapStyle from '@/lib/map/mapStyle.json';
import { Event } from '@/types/db';

interface MapProps {
    events?: Event[];
}

const Map = ({ events = [] }: MapProps) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    });

    // Lund, Sweden coordinates
    const center = useMemo(() => ({ lat: 55.7047, lng: 13.1910 }), []);

    if (loadError) return <div>Failed to load maps</div>;
    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div className="w-screen h-screen bg-black">
            <GoogleMap
                center={center}
                zoom={13}
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
                {events.map((event: Event) => (
                    <Marker
                        key={event.id}
                        position={{
                            lat: event.latitude,
                            lng: event.longitude,
                        }}
                        label={event.organization_name.charAt(0).toUpperCase()} // First letter of org
                        title={`${event.name} by ${event.organization_name}`}
                        onClick={() => {
                            console.log(`Clicked on event: ${event.name} (ID: ${event.id})`);
                            alert(`Event: ${event.name}\nAddress: ${event.address}`);
                        }}
                    />
                ))}
            </GoogleMap>
        </div>
    );
};

export default Map;