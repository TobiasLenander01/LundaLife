import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const result = await db.query(`
      SELECT
        events.id,
        events.name,
        events.description,
        events.link,
        events.start_date,
        events.end_date,
        nations.name AS nation_name,
        nations.address AS nation_address
      FROM events
      JOIN nations ON events.nation_id = nations.id
      ORDER BY events.start_date DESC
    `);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}
