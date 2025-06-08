import { getOrganizations } from '@/database/db';
import MapPageClient from '@/components/MapClient';

export default async function Page() {
  // Fetch organizations from the database
  const organizations = await getOrganizations();

  // Pass the organizations to the MapPageClient component
  return <MapPageClient organizations={organizations} />;
}