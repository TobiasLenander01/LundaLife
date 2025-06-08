'use client';

import React, { useState } from 'react';
import BottomSheet from '@/components/BottomSheet';
import GoogleMap from '@/components/GoogleMap';
import { Organization } from '@/types/db';

interface MapPageClientProps {
  organizations: Organization[];
}

function MapPageClient({ organizations }: MapPageClientProps) {

  // State to manage the bottom sheet visibility
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const openSheet = () => setIsSheetOpen(true);
  const closeSheet = () => setIsSheetOpen(false);

  const markers = organizations.map(org => ({
    id: org.id,
    lat: org.latitude,
    lng: org.longitude,
    title: org.name,
    icon: org.icon ?? undefined,
    content: org.events?.map(event => `${event.name} ${event.start_date}`).join('\n') ?? '',
  }));

  return (
    <div>
      <GoogleMap markers={markers} />
      <BottomSheet 
        isOpen={isSheetOpen} 
        onOpen={openSheet} 
        onClose={closeSheet}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Sheet Content</h2>
          <p className="text-gray-600">
            Drag this sheet down to close it.
          </p>
        </div>
      </BottomSheet>
    </div>
  );
}

export default MapPageClient;