import { getUpcomingEvents } from '@/server/db';
import Map from '@/components/map/Map';

export default async function Home() {
  // Get events from database
  const events = await getUpcomingEvents();

  // Render map with events
  return <Map events={events.length > 0 ? events : []} />;
}