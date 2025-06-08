// app/MapPageClient.tsx (Merged Version)

'use client';

import React, { useState } from 'react';
import BottomSheet from '@/components/BottomSheet';
import Map from '@/components/MapComponent'; // <-- Import Map directly
import { Organization } from '@/types/db';

interface MapPageClientProps {
  organizations: Organization[];
}

function MapPageClient({ organizations }: MapPageClientProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const openSheet = () => setIsSheetOpen(true);
  const closeSheet = () => setIsSheetOpen(false);

  // --- Logic from LundMap.tsx is now here ---
  const markers = organizations.map(org => ({
    id: org.id,
    lat: org.latitude,
    lng: org.longitude,
    title: org.name,
    icon: org.icon ?? undefined,
    content: org.events?.map(event => `${event.name} ${event.start_date}`).join('\n') ?? '',
  }));
  // --- End of merged logic ---

  return (
    <div>
      <h1 className="text-2xl font-bold">Background Content</h1>
      <p>You can interact with these buttons even when the sheet is open.</p>

      <button
        onClick={() => alert('Background button clicked!')}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
      >
        Test Interaction
      </button>

      <button
        onClick={openSheet}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Open Bottom Sheet
      </button>

      <Map markers={markers} />

      {/* BottomSheet component (no changes here) */}
      <BottomSheet isOpen={isSheetOpen} onClose={closeSheet}>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Sheet Content</h2>
          <p className="text-gray-600">
            Click the "Test Interaction" button in the background!
          </p>
          <button
            onClick={closeSheet}
            className="mt-6 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Close Sheet
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

export default MapPageClient;