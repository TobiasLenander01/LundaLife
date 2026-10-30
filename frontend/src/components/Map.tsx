'use client';

import Image from 'next/image';
import { useEffect, useSyncExternalStore } from 'react';
import { APIProvider, Map, AdvancedMarker, ColorScheme, useMap } from '@vis.gl/react-google-maps';
import { useTheme } from '@/lib/theme';
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

// True once hydrated, when the real theme is known (false during server rendering and hydration)
const subscribeNever = () => () => {};
function useHydrated() {
    return useSyncExternalStore(subscribeNever, () => true, () => false);
}

export default function MapComponent({ markers, selectedId, onSelect, focusOffsetY = 0 }: MapComponentProps) {
    const theme = useTheme();
    const hydrated = useHydrated();

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
    if (!apiKey || !mapId) {
        console.error('Google Maps API Key or Map ID is not defined');
        return (
            <div className="flex h-full w-full items-center justify-center bg-muted p-6 text-center text-sm text-fg-muted">
                The map cannot be loaded right now.
            </div>
        );
    }

    const selected = markers.find((marker) => marker.organization.id === selectedId)?.organization;

    // Wait for the real theme, so the map isn't created in light mode and then recreated in dark mode
    if (!hydrated) {
        return <div className="h-full w-full bg-muted" />;
    }

    return (
        <div className="h-full w-full select-none">
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={CENTER}
                    defaultZoom={15}
                    maxZoom={19}
                    minZoom={12}
                    mapId={mapId}
                    // Changing the color scheme recreates the map (keeping the camera position)
                    colorScheme={theme === 'dark' ? ColorScheme.DARK : ColorScheme.LIGHT}
                    disableDefaultUI={true}
                    clickableIcons={false}
                    gestureHandling={'greedy'}
                    backgroundColor={theme === 'dark' ? '#1e293b' : '#e5e7eb'}
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
                                <MarkerPin organization={organization} count={count} selected={isSelected} />
                            </AdvancedMarker>
                        );
                    })}

                    <FocusSelected organization={selected} offsetY={focusOffsetY} />
                </Map>
            </APIProvider>
        </div>
    );
}

// The organization's logo in a round pin, with the number of events as a badge
function MarkerPin({ organization, count, selected }: { organization: Organization; count: number; selected: boolean }) {
    const ring = selected ? 'border-accent' : 'border-white';
    const pointer = selected ? 'border-t-accent' : 'border-t-white';

    return (
        <div className={`relative flex origin-bottom flex-col items-center transition-transform duration-200 ${selected ? 'scale-125' : 'hover:scale-110'}`}>
            <div className={`relative size-11 rounded-full border-[3px] bg-white shadow-lg ${ring}`}>
                {organization.logo ? (
                    <Image
                        src={organization.logo}
                        alt=""
                        width={44}
                        height={44}
                        className={`size-full rounded-full object-cover ${count === 0 && !selected ? 'opacity-60 grayscale' : ''}`}
                    />
                ) : (
                    <span className="flex size-full items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                        {organization.name.charAt(0)}
                    </span>
                )}

                {count > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-primary px-1 text-[11px] font-semibold text-white tabular-nums">
                        {count}
                    </span>
                )}
            </div>
            <div className={`-mt-px h-0 w-0 border-x-[7px] border-t-[8px] border-x-transparent ${pointer}`} />

            {/* Name label, positioned so it doesn't move the marker's anchor point */}
            {selected && (
                <span className="absolute top-full mt-1 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-fg shadow-md">
                    {organization.name}
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
