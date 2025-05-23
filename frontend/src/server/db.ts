import db from '@/lib/db';
import { Event } from '@/types/db';

export async function getEvents(): Promise<Event[]> {
    const res = await db.query(`
    SELECT
      events.id,
      events.name,
      events.description,
      events.address,
      events.latitude,
      events.longitude,
      events.image,
      events.link,
      events.start_date,
      events.end_date,
      organizations.id AS organization_id,
      organizations.name AS organization_name,
      organizations.address AS organization_address,
      organizations.latitude AS organization_latitude,
      organizations.longitude AS organization_longitude,
      organizations.stuk_id,
      organizations.fb_id
    FROM events
    JOIN organizations ON events.organization_id = organizations.id
    WHERE events.start_date >= NOW()
    ORDER BY events.start_date ASC
  `);

    return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        address: row.address,
        latitude: row.latitude,
        longitude: row.longitude,
        image: row.image,
        link: row.link,
        start_date: row.start_date,
        end_date: row.end_date,
        organization: {
            id: row.organization_id,
            name: row.organization_name,
            address: row.organization_address,
            latitude: row.organization_latitude,
            longitude: row.organization_longitude,
            stuk_id: row.stuk_id,
            fb_id: row.fb_id,
        }
    }));
}
