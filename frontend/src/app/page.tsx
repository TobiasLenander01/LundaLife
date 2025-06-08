import { getOrganizations } from '@/database/database';
import Map from '@/components/Map';

export default async function Page() {
  // Fetch organizations from the database
  const organizations = await getOrganizations();

  // Pass the organizations to the Map component
  return <Map organizations={organizations} />;
}