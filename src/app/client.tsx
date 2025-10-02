'use client';

import Header from "@/components/Header";
import Map from '@/components/Map';
import Drawer from '@/components/Drawer';
import EventCard from '@/components/EventCard';
import OrganizationComponent from '@/components/Organization';
import { filterOrganizations, filterEvents } from '@/lib/helpers';
import { Organization } from '@/types/app';
import { CustomMarker, FilterOption, FilterOptions } from '@/types/app';
import { useState, useMemo } from 'react';

interface ClientProps {
  organizations?: Organization[];
}

export default function Client({ organizations = [] }: ClientProps) {
  // State variables to manage selected filter and organization
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>(FilterOptions[0]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  
  // Use useMemo to cache result and recalculate only when dependencies change
  const filteredOrganizations = useMemo(() => 
    filterOrganizations(organizations, selectedFilter), 
    [organizations, selectedFilter]
  );
  
  const filteredEvents = useMemo(() => 
    filterEvents(selectedOrganization?.events ?? [], selectedFilter), 
    [selectedOrganization?.events, selectedFilter]
  );

  // Create custom markers for the map based on organizations
  const markers: CustomMarker[] = filteredOrganizations.map((org) => ({
    id: org.stuk_id,
    lat: org.latitude,
    lng: org.longitude,
    title: org.name ?? 'Unnamed Organization',
    icon: org.icon ?? undefined,
    onClick: () => setSelectedOrganization(org),
  }));

  return (
    <div className="flex flex-col h-screen">

      {/* Render Header component with logo and filter drop down menu */}
      <Header selectedFilter={selectedFilter} handleFilterChange={(filterValue: FilterOption) => setSelectedFilter(filterValue)} />

      {/* Render Google Map with markers for the organizations */}
      <Map markers={markers} />

      {/* Drawer for displaying organization details */}
      <Drawer open={!!selectedOrganization} onOpenChange={() => {setSelectedOrganization(null)}}>
        {selectedOrganization && (
          <div className="space-y-6">
            {/* Organization Info */}
            <OrganizationComponent
              organization={selectedOrganization}
            />

            {/* Events Section */}
            <div className="mb-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">{selectedFilter.label}</h3>
              {filteredEvents.length > 0 ? (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <EventCard event={event} key={event.id} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No events found for this time period.</p>
                  <p className="text-sm text-gray-400">Try selecting a different time filter.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
}