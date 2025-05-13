
// Load the map component on client-side only
'use client';
import dynamic from 'next/dynamic';
const Map = dynamic(() => import('@/components/map/Map'), { ssr: false });

// Export the home page component
export default function Home() {
  return (
    <Map />
  );
}
