import { Event } from '@/types/database';
import { formatDateTime } from '@/lib/helpers';

interface EventCardProps {
    event: Event;
}

export default function EventCard({ event }: EventCardProps) {
    return (
        <div className="p-4 mb-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">{event.name}</h3>
            <p className="text-sm text-gray-600">
                {formatDateTime(event.start_date)}{event.end_date && ` - ${formatDateTime(event.end_date)}`}
            </p>
            <p className="mt-2 text-gray-700">{event.description}</p>
        </div>
    );
}