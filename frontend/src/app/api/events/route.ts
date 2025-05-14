import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const result = await db.query(`
      SELECT
        id,
        organization_id,
        organization_name,
        name,
        description,
        address,
        image,
        link,
        start_date,
        end_date
      FROM events
      ORDER BY events.start_date DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
