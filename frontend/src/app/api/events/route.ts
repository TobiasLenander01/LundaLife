import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const result = await db.query(`
      SELECT *
      FROM events
      JOIN organizations ON events.organization_id = organizations.id
      WHERE events.start_date >= NOW()
      ORDER BY events.start_date DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
