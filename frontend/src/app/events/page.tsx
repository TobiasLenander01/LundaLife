import { Event } from '@/types/db';
import { getEvents } from '@/server/db';

export default async function EventsPage() {
    // Get events from database
  const events: Event[] = await getEvents();

    return (
        <div className="p-4 space-y-4">
            {events.map((event) => (
                <div key={event.id} className="border p-4 rounded-xl shadow space-y-2">
                    <h2 className="text-xl font-semibold">{event.name}</h2>
                    
                    {/* Show image if available */}
                    {event.image && (
                        <img
                            src={event.image}
                            alt={event.name}
                            className="w-full max-w-md rounded-lg object-cover"
                        />
                    )}

                    <p>{event.description}</p>
                    <p className="text-sm text-gray-500">
                        {new Date(event.start_date).toLocaleString()} –{' '}
                        {event.end_date ? new Date(event.end_date).toLocaleString() : 'TBD'}
                    </p>
                    <p className="text-sm mt-2 italic">
                        Hosted by {event.organization.name} ({event.address})
                    </p>
                    {event.link && (
                        <a
                            href={event.link}
                            className="text-blue-600 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            More Info
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
}
