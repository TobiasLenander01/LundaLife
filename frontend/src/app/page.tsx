import { getOrganizations } from '@/database/db';
import { Organization } from '@/types/db';
import MapComponent from '@/components/Map';
import BottomSheet from '@/components/BottomSheet';

export default async function Home() {
  // Get organizations from database
  const organizations: Organization[] = await getOrganizations();

  // Create markers for each organization
  const markers = organizations.map(org => ({
    id: org.id,
    lat: org.latitude,
    lng: org.longitude,
    title: org.name,
    icon: org.icon ?? undefined,
    content: org.events?.map(event => `${event.name} ${event.start_date}`).join('\n') ?? '',
  }));

  // Render map with markers
  return (
    <div>
      <MapComponent markers={markers} />
      <BottomSheet title="Always-On Drawer">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Always-On Drawer</h2>
          <p>This drawer is always visible and cannot be closed by the user.</p>
          <p className="mt-4">
            You can still interact with it by changing its snap points.
          </p>
        </div>
      </BottomSheet>
    </div>
  );
}