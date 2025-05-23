'use client';

import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { useMemo } from 'react';
import mapStyle from '@/lib/map/mapStyle.json';
import { Event } from '@/types/db';

interface MapProps {
    events?: Event[]; // events is already optional from your page.tsx logic
}

const MapComponent = ({ events = [] }: MapProps) => { // Renamed to MapComponent to avoid conflict if you export default Map
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    });

    // Lund, Sweden coordinates
    const center = useMemo(() => ({ lat: 55.7047, lng: 13.1910 }), []);

    if (loadError) {
        console.error("Google Maps API load error:", loadError);
        return <div>Failed to load maps. Check the console for details.</div>;
    }
    if (!isLoaded) return <div>Loading Google Maps...</div>;

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
                            // Ensure latitude and longitude are not null.
                            // Your Event type allows them to be null, which could be an issue.
                            // You might want to filter out events without lat/lng before passing to Map
                            // or handle it here. For now, assuming they are present.
                            lat: event.latitude!,
                            lng: event.longitude!,
                        }}
                        // Corrected access to organization name
                        label={event.organization.name.charAt(0).toUpperCase()}
                        title={`${event.name} by ${event.organization.name}`}
                        onClick={() => {
                            console.log(`Clicked on event: ${event.name} (ID: ${event.id})`);
                            // You might want a more sophisticated info window or modal here
                            alert(`Event: ${event.name}\nOrganization: ${event.organization.name}\nAddress: ${event.address || 'N/A'}`);
                        }}
                    />
                ))}
            </GoogleMap>
        </div>
    );
};

export default MapComponent; // Or export default Map; if you rename the const