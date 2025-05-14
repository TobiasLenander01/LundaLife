'use client';

import { useEffect, useState } from 'react';

type Event = {
    id: number;
    name: string;
    description: string | null;
    link: string | null;
    start_date: string;
    end_date: string | null;
    nation_name: string;
    nation_address: string;
};

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        fetch('/api/events')
            .then((res) => res.json())
            .then(setEvents)
            .catch(console.error);
    }, []);

    return (
        <div className="p-4 space-y-4">
            {events.map((event) => (
                <div key={event.id} className="border p-4 rounded-xl shadow">
                    <h2 className="text-xl font-semibold">{event.name}</h2>
                    <p>{event.description}</p>
                    <p className="text-sm text-gray-500">
                        {new Date(event.start_date).toLocaleString()} – {event.end_date ? new Date(event.end_date).toLocaleString() : 'TBD'}
                    </p>
                    <p className="text-sm mt-2 italic">Hosted by {event.nation_name} ({event.nation_address})</p>
                    {event.link && (
                        <a href={event.link} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                            More Info
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
}