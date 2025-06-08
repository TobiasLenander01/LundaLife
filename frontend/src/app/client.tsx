// client.tsx
'use client';

import Map from '@/components/Map';
import Drawer from '@/components/Drawer';
import { Organization } from '@/types/database';
import { CustomMarker } from '@/types/map';
import React, { useState } from 'react';

interface ClientProps {
  organizations?: Organization[];
}

export default function Client({ organizations = [] }: ClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const markers: CustomMarker[] = organizations.map((org) => ({
    id: org.id,
    lat: org.latitude,
    lng: org.longitude,
    title: org.name,
    icon: org.icon ?? undefined,
    content:
      org.events?.map((event) => `${event.name} ${event.start_date}`).join('\n') ?? '',
  }));

  return (
    <div className="flex flex-col h-screen">
      <button
        onClick={handleOpenDrawer}
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 shadow-lg"
      >
        Open Drawer
      </button>

      <Map markers={markers} />

      {/* Pass the new required `title` prop here */}
      <Drawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        title="List of Organizations" // A descriptive title for screen readers
      >
        <h2 className="text-xl font-bold mb-4">Organizations</h2>
        <p className="text-zinc-600 mb-6">
          Here is a list of organizations from the map.
        </p>
        <ul className="space-y-2">
          {organizations.map((org) => (
            <li key={org.id} className="font-medium text-gray-800">
              {org.name}
            </li>
          ))}
        </ul>
      </Drawer>
    </div>
  );
}