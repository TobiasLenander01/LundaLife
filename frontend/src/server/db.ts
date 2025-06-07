import db from '@/lib/db';
import { Organization, Event } from '@/types/db';

export async function getOrganizations(): Promise<Organization[]> {
  
  // Define SQL query
  const query = `
    SELECT
      organizations.id,
      organizations.name,
      organizations.address,
      organizations.latitude,
      organizations.longitude,
      organizations.stuk_id,
      organizations.fb_id,
      organizations.icon,
      COALESCE(
        json_agg(
          json_build_object(
            'id', events.id,
            'organization_id', events.organization_id,
            'name', events.name,
            'description', events.description,
            'address', events.address,
            'latitude', events.latitude,
            'longitude', events.longitude,
            'image', events.image,
            'link', events.link,
            'start_date', events.start_date,
            'end_date', events.end_date
          ) ORDER BY events.start_date ASC
        ) FILTER (WHERE events.id IS NOT NULL),
        '[]'::json
      ) AS events
    FROM
      organizations
    LEFT JOIN
      events ON organizations.id = events.organization_id AND events.start_date > NOW()
    GROUP BY
      organizations.id
    ORDER BY
      organizations.name ASC;
  `;

  // Execute the SQL query to fetch organizations and their associated events
  try {
    const res = await db.query(query);

    // Map each row to the Organization type, parsing the events JSON array
    return res.rows.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
      stuk_id: row.stuk_id,
      fb_id: row.fb_id,
      icon: row.icon,
      events: row.events as Event[] // Cast the events field to Event[]
    }));
  } catch (error) {
    console.error("Error fetching organizations with events:", error);
    throw error;
  }
}

export async function getEvents(): Promise<Event[]> {
  // Define SQL query to fetch future events and their associated tickets
  const query = `
    SELECT
      *
    FROM
      events
    WHERE
      events.start_date > NOW()
    ORDER BY
      events.start_date ASC;
  `;

  try {
    const res = await db.query(query);

    // Map each row to the Event type, parsing the tickets JSON array
    return res.rows.map(row => ({
      id: row.id,
      organization_id: row.organization_id,
      name: row.name,
      description: row.description,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
      image: row.image,
      link: row.link,
      start_date: row.start_date,
      end_date: row.end_date
    }));
  } catch (error) {
    console.error("Error fetching future events with tickets:", error);
    throw error;
  }
}