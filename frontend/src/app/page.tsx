import { getOrganizations } from '@/database/db';
import { Organization } from '@/types/db';
import MapComponent from '@/components/map/Map';

export default async function Home() {
  // Get organizations from database
  const organizations: Organization[] = await getOrganizations();

  // Create markers for each organization
  const markers = organizations.map(org => ({
    id: org.id,
    lat: org.latitude,
    lng: org.longitude,
    title: org.name,
    icon: org.icon ?? undefined,
    content: org.events?.map(event => `${event.name} ${event.start_date}`).join('\n') ?? '',
  }));

  // Render map with markers
  return (
    <MapComponent markers={markers} />
  );
}