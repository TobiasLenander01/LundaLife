
// Load the map component on client-side only
'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Event } from '@/types/db';
const Map = dynamic(() => import('@/components/map/Map'), { ssr: false });

export default function Home() {  
  // Get events from database
  const [events, setEvents] = useState<Event[]>([]);
  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then(setEvents)
      .catch(console.error);
  }, []);

  console.log(events)

  // Render map with markers if there are events, else an empty array
  return <Map events={events.length > 0 ? events : []} />;
}
