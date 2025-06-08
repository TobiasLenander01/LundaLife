import { getEvents } from '@/database/db';
import { Event } from '@/types/db';

export default async function EventsPage() {
    // Load events from database
    const events: Event[] = await getEvents();

    return (
        <div>
            {events.map(event => (
                <h1 key={event.id}>{event.name}</h1>
            ))}
        </div>
    );
}
