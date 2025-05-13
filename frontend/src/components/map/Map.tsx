'use client';

import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { useMemo } from 'react';
import mapStyle from '@/lib/map/mapStyle.json';

const Map = () => {
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
            </GoogleMap>
        </div>
    );
};

export default Map;
