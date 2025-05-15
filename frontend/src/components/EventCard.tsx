"use client";

import { useEffect, useState } from "react";
import { Event } from '@/types/db';

export default function EventCard() {
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        fetch('/api/events')
            .then(res => res.json())
            .then(data => {
                console.log('Fetched:', data);
                setEvents(data);
            })
            .catch(err => {
                console.error('Client fetch error:', err);
                return (<div>{err}</div>);
            });
    }, []);

    console.log(events);
    const event = events[0];

    if (!event) {
        return <div>Loading event...</div>;
    }

    return (
        <div className="flex">
            <h1>{event.name}</h1>
            <div>
                {new Date(event.start_date).toLocaleString()}
                -
                {event.end_date ? new Date(event.end_date).toLocaleString() : ""}
            </div>
            <div>{event.organization_name}</div>
            <div>{event.address}</div>
            <a href={event.link ?? ""}>See Event</a>
        </div>
    )
};