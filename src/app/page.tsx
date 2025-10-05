import { getOrganizations } from '@/lib/api';
import Client from './client';
import Loading from '@/components/Loading';
import { Suspense } from 'react';

async function OrganizationsProvider() {
  // Fetch organizations
  const organizations = await getOrganizations();

  // Pass the organizations to the client component
  return <Client organizations={organizations} />;
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <OrganizationsProvider />
    </Suspense>
  );
}