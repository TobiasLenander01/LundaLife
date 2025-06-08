import { getOrganizations } from '@/database/database';
import Client from './client';

export default async function Server() {
  // Fetch organizations from the database
  const organizations = await getOrganizations();

  // Pass the organizations to the Map component
  return <Client organizations={organizations} />;
}