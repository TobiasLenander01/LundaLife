import { getOrganizations } from '@/lib/api';
import Client from './client';

export default async function Server() {
  // Fetch organizations
  const organizations = await getOrganizations();

  // Pass the organizations to the client component
  return <Client organizations={organizations} />;
}