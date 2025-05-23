import { getEvents } from '@/server/db';
import Map from '@/components/map/Map';

export default async function Home() {
  // Get events from database
  const events = await getEvents();

  // Render map with events
  return <Map events={events.length > 0 ? events : []} />;
}