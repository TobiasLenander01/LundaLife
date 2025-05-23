import { getUpcomingEvents } from '@/server/db';
import Map from '@/components/map/Map'; // Directly import your Map component

export default async function Home() {
  // Get events from database (runs on the server)
  const events = await getUpcomingEvents();

  // Render map with markers if there are events, else an empty array
  // The 'events' data is serialized and passed to the client-side Map component
  return <Map events={events.length > 0 ? events : []} />;
}