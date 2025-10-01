import { getOrganizations } from '@/lib/api';
import Client from './client';

export default async function Server() {
  // Fetch organizations from the STUK API
  const organizations = await getOrganizations();

  // Pass the organizations to the Map component
  return <Client organizations={organizations} />;
}