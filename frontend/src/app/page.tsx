// app/page.tsx

import { getOrganizations } from '@/database/db';
import MapPageClient from '@/components/MapClient'; // We will create this next

export default async function Page() {
  // 1. Fetch data on the server. This is safe.
  const organizations = await getOrganizations();

  // 2. Pass the fetched data as a prop to the Client Component.
  return <MapPageClient organizations={organizations} />;
}