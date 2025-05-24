import { getOrganizations } from '@/server/db';
import { Organization } from '@/types/db';
import Map from '@/components/map/Map';

export default async function Home() {
  // Get organizations from database
  const organizations: Organization[] = await getOrganizations();

  // Create markers for each organization
  const markers = organizations.map(org => ({
    id: org.id,
    lat: org.latitude,
    lng: org.longitude,
    title: org.name
  }));

  // Render map with markers
  return (
    <Map markers={markers} />
  );
}