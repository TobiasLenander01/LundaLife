"use client";

import { useEffect, useState } from "react";
import { Event } from '@/types/db';

function hej(event: Event) {
    const start = new Date(event.start_date);
    const end = event.end_date ? new Date(event.end_date) : null;

    let the_end;

    if (start.getDay !== end?.getDay) {
        {
            the_end = event.end_date ? new Date(event.end_date).toLocaleString('sv-SV', {
                hour: '2-digit',
                minute: '2-digit'
            }) : ""
        }
    }
    else {
        the_end = event.end_date ? new Date(event.end_date).toLocaleString('sv-SV', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }) : ""
    }
    return the_end
}

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
            <div className="uppercase column">
                <div>
                    {new Date(event.start_date).toLocaleDateString('sv-SV', { month: 'short' })}
                </div>
                <div>
                    {new Date(event.start_date).toLocaleDateString('sv-SV', { day: 'numeric' })}
                </div>
            </div>
            <div className="column">
                <div>
                    {new Date(event.start_date).toLocaleString('sv-SV', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                    {" "} - {" "}
                    {hej(event)}
                </div>
                <div>{event.name}</div>

                <div>{event.organization_name}</div>
            </div>

            <a href={event.link ?? ""}>See Event</a>
        </div>
    )
};