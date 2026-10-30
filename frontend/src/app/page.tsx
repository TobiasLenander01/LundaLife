'use client';

import { useStukOrganizations } from '@/lib/stuk';
import Client from './client';

export default function Page() {
  // Load the organizations and their events from Stuk in the browser
  const { organizations, loading, error, retry } = useStukOrganizations();

  return <Client organizations={organizations} loading={loading} error={error} onRetry={retry} />;
}
