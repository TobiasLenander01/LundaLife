'use client';

import Header from "@/components/Header";
import Map from '@/components/Map';
import Drawer from '@/components/Drawer';
import EventCard from '@/components/EventCard';
import { isToday, isThisWeek, isThisMonth } from '@/lib/helpers';
import { Organization } from '@/types/database';
import { CustomMarker, FilterOption, FilterOptions } from '@/types/app';
import { useState, useMemo } from 'react';

interface ClientProps {
  organizations?: Organization[];
}

export default function Client({ organizations = [] }: ClientProps) {
  // State variables to manage selected filter and organization
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>(FilterOptions[0]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  // Memoize the filtered list of organizations.
  const filteredOrganizations = useMemo(() => {
    // Helper to check if an org has an event matching a date condition.
    const hasMatchingEvent = (org: Organization, dateCheckFn: (dateStr: string) => boolean) => {
      if (!org.events || org.events.length === 0) {
        return false;
      }
      return org.events.some(event => dateCheckFn(event.start_date));
    };

    switch (selectedFilter.value) {
      case 'today':
        return organizations.filter(org => hasMatchingEvent(org, isToday));
      case 'this-week':
        return organizations.filter(org => hasMatchingEvent(org, isThisWeek));
      case 'this-month':
        return organizations.filter(org => hasMatchingEvent(org, isThisMonth));
      default:
        return organizations;
    }
  }, [organizations, selectedFilter]);

  // Memoize the list of events to show in the drawer, filtered by the selected time period.
  const eventsForDrawer = useMemo(() => {
    if (!selectedOrganization || !selectedOrganization.events) return [];

    const dateCheckFn = {
      'today': isToday,
      'this-week': isThisWeek,
      'this-month': isThisMonth,
    }[selectedFilter.value];

    if (dateCheckFn) {
      return selectedOrganization.events.filter(event => dateCheckFn(event.start_date));
    }

    // if no filter matches, show all events for the selected org
    return selectedOrganization.events;
  }, [selectedOrganization, selectedFilter]);

  // Function to handle filter change
  const handleFilterChange = (filterValue: FilterOption) => {
    setSelectedFilter(filterValue);
  };

  // Create custom markers for the map based on organizations
  const markers: CustomMarker[] = filteredOrganizations.map((org) => ({
    id: org.id,
    lat: org.latitude,
    lng: org.longitude,
    title: org.name ?? 'Unnamed Organization',
    icon: org.icon ?? undefined,
    onClick: () => setSelectedOrganization(org),
  }));

  // Function to handle drawer close event
  const handleDrawerClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedOrganization(null);
    }
  };

  return (
    <div className="flex flex-col h-screen">

      {/* Render Header component with logo and filter drop down menu */}
      <Header selectedFilter={selectedFilter} handleFilterChange={handleFilterChange} />

      {/* Render Google Map with markers for the organizations */}
      <Map markers={markers} />

      {/* Drawer for displaying organization details */}
      <Drawer open={!!selectedOrganization} onOpenChange={handleDrawerClose}>
        {selectedOrganization && (
          <>
            <h2 className="text-xl font-bold mb-4">{selectedOrganization.name}</h2>
            <h3 className="text-lg font-semibold mb-2">{selectedFilter.label}</h3>
            {eventsForDrawer.length > 0 ? (
              <div>
                {eventsForDrawer.map((event) => (
                  <EventCard event={event} key={event.id} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No events found for this time period.</p>
            )}
          </>
        )}
      </Drawer>

    </div>
  );
}