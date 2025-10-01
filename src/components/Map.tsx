'use client';

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import Image from 'next/image';
import { CustomMarker } from '@/types/app';

export interface MapComponentProps {
    markers?: CustomMarker[];
    center?: { lat: number; lng: number }
}

export default function MapComponent({
    markers = [],
    center = { lat: 55.7046, lng: 13.2034 }
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

    const bounds = {
        north: 55.74766427388623,
        south: 55.65894489663065,
        east: 13.320602609509232,
        west: 13.10776401441946,
    };

    return (
        <div className="select-none h-full w-full">
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={center}
                    defaultZoom={15}
                    maxZoom={19}
                    minZoom={12}
                    mapId={mapId}
                    disableDefaultUI={true}
                    gestureHandling={'greedy'}
                    backgroundColor={'#000000'}
                    restriction={{
                        latLngBounds: bounds,
                        strictBounds: false,
                    }}
                >
                    {markers.map((marker, index) => (
                        <AdvancedMarker
                            key={index}
                            position={{ lat: marker.lat, lng: marker.lng }}
                            onClick={marker.onClick}
                        >
                            {marker.glyph ? (
                                marker.glyph
                            ) : (
                                <div className="bg-white rounded-full shadow-lg border-2 border-blue-900 flex items-center justify-center">
                                    {/* Use organization icon if available, otherwise show organization initials */}
                                    {marker.icon ? (
                                        <Image 
                                            src={marker.icon} 
                                            alt={marker.title || 'Organization'} 
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="w-6 h-6 bg-blue-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {marker.title?.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase() || 'ORG'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </AdvancedMarker>
                    ))}

                </Map>
            </APIProvider>
        </div>
    );
};