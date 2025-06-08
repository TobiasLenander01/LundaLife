import { Event } from '@/types/database';

interface EventCardProps {
    event: Event;
}

export default function EventCard({ event }: EventCardProps) {
    return (
        <div className="p-4 mb-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">{event.name}</h3>
            <p className="text-sm text-gray-600">
                {(event.start_date ? new Date(event.start_date).toLocaleDateString() : 'N/A')} - {(event.end_date ? new Date(event.end_date).toLocaleDateString() : 'N/A')}
            </p>
            <p className="mt-2 text-gray-700">{event.description}</p>
        </div>
    );
}