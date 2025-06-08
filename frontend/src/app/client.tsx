'use client';

import Map from '@/components/Map';
import Drawer from '@/components/Drawer';
import EventCard from '@/components/EventCard';
import { Organization } from '@/types/database';
import { CustomMarker } from '@/types/map';
import React, { useState } from 'react';

interface ClientProps {
  organizations?: Organization[];
}

export default function Client({ organizations = [] }: ClientProps) {
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  const markers: CustomMarker[] = organizations.map((org) => ({
    id: org.id,
    lat: org.latitude,
    lng: org.longitude,
    title: org.name ?? 'Unnamed Organization',
    icon: org.icon ?? undefined,
    onClick: () => setSelectedOrganization(org),
  }));

  const handleDrawerClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedOrganization(null);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Render Google Map with markers for the organizations */}
      <Map markers={markers} />

      {/* Drawer for displaying organization details */}
      <Drawer open={!!selectedOrganization} onOpenChange={handleDrawerClose}>
        {selectedOrganization && (
          <>
            <h2 className="text-xl font-bold mb-4">{selectedOrganization.name}</h2>
            <h3 className="text-lg font-semibold mb-2">Events</h3>
            {selectedOrganization.events && selectedOrganization.events.length > 0 ? (
              <div>
                {selectedOrganization.events.map((event) => (
                  <EventCard event={event} key={event.id} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No events found for this organization.</p>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}