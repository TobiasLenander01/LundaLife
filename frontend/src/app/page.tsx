import { getOrganizations } from '@/database/db';
import Map from '@/components/GoogleMap';

export default async function Page() {
  // Fetch organizations from the database
  const organizations = await getOrganizations();

  // Pass the organizations to the Map component
  return <Map organizations={organizations} />;
}