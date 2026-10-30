import { connection } from 'next/server';
import { getOrganizations } from '@/database/database';
import Client from './client';

export default async function Server() {
  // Render on every request so newly scraped events show up
  // (otherwise the page is prerendered once at build time)
  await connection();

  // Fetch organizations from the database
  const organizations = await getOrganizations();

  // Pass the organizations to the Map component
  return <Client organizations={organizations} />;
}