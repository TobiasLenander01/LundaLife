'use client';

import { useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { Organization } from '@/types/events';

export interface MapMarker {
    organization: Organization;
    // Number of events in the current filter
    count: number;
}

export interface MapComponentProps {
    markers: MapMarker[];
    selectedId: number | null;
    onSelect: (organization: Organization | null) => void;
    // Pixels to shift the selected marker up, so it isn't hidden behind the bottom sheet
    focusOffsetY?: number;
}

const CENTER = { lat: 55.7046, lng: 13.2034 };

const BOUNDS = {
    north: 55.74766427388623,
    south: 55.65894489663065,
    east: 13.320602609509232,
    west: 13.10776401441946,
};

export default function MapComponent({ markers, selectedId, onSelect, focusOffsetY = 0 }: MapComponentProps) {

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
    if (!apiKey || !mapId) {
        console.error('Google Maps API Key or Map ID is not defined');
        return (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 p-6 text-center text-sm text-slate-500">
                The map cannot be loaded right now.
            </div>
        );
    }

    const selected = markers.find((marker) => marker.organization.id === selectedId)?.organization;

    return (
        <div className="h-full w-full select-none">
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={CENTER}
                    defaultZoom={15}
                    maxZoom={19}
                    minZoom={12}
                    mapId={mapId}
                    disableDefaultUI={true}
                    clickableIcons={false}
                    gestureHandling={'greedy'}
                    backgroundColor={'#e5e7eb'}
                    restriction={{
                        latLngBounds: BOUNDS,
                        strictBounds: false,
                    }}
                    onClick={() => onSelect(null)}
                >
                    {markers.map(({ organization, count }) => {
                        const isSelected = organization.id === selectedId;
                        return (
                            <AdvancedMarker
                                key={organization.id}
                                position={{ lat: organization.latitude, lng: organization.longitude }}
                                title={organization.name}
                                zIndex={isSelected ? 1000 : count}
                                onClick={() => onSelect(organization)}
                            >
                                <MarkerPin count={count} name={organization.name} selected={isSelected} />
                            </AdvancedMarker>
                        );
                    })}

                    <FocusSelected organization={selected} offsetY={focusOffsetY} />
                </Map>
            </APIProvider>
        </div>
    );
}

function MarkerPin({ count, name, selected }: { count: number; name: string; selected: boolean }) {
    const color = selected ? 'bg-accent text-brand' : count > 0 ? 'bg-brand text-white' : 'bg-slate-400 text-white';
    const pointer = selected ? 'border-t-accent' : count > 0 ? 'border-t-brand' : 'border-t-slate-400';

    return (
        <div className={`relative flex origin-bottom flex-col items-center transition-transform duration-200 ${selected ? 'scale-125' : 'hover:scale-110'}`}>
            <div className={`flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-white px-1.5 text-sm font-semibold shadow-md ${color}`}>
                {count > 0 ? count : <span className="size-2 rounded-full bg-white" />}
            </div>
            <div className={`-mt-px h-0 w-0 border-x-[6px] border-t-[7px] border-x-transparent ${pointer}`} />

            {/* Name label, positioned so it doesn't move the marker's anchor point */}
            {selected && (
                <span className="absolute top-full mt-1 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-brand shadow-md">
                    {name}
                </span>
            )}
        </div>
    );
}

// Pans the map to the selected organization
function FocusSelected({ organization, offsetY }: { organization?: Organization; offsetY: number }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !organization) return;

        const position = new google.maps.LatLng(organization.latitude, organization.longitude);
        const projection = map.getProjection();
        const zoom = map.getZoom();

        if (!projection || zoom === undefined || offsetY === 0) {
            map.panTo(position);
            return;
        }

        // Move the center below the marker, so the marker ends up offsetY pixels above the center
        const point = projection.fromLatLngToPoint(position)!;
        const scale = 2 ** zoom;
        map.panTo(projection.fromPointToLatLng(new google.maps.Point(point.x, point.y + offsetY / scale))!);
    }, [map, organization, offsetY]);

    return null;
}
