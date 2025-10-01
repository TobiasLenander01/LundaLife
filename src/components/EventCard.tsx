import { Event } from '@/types/app';
import Link from 'next/link';
import { FiCalendar, FiMapPin, FiExternalLink } from 'react-icons/fi';

interface EventCardProps {
    event: Event;
    className?: string;
}

export default function EventCard({ event, className = '' }: EventCardProps) {

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDateRange = () => {
        const startDate = new Date(event.start_date);
        const endDate = event.end_date ? new Date(event.end_date) : null;
        
        if (!endDate) {
            return formatDate(event.start_date);
        }
        
        const isSameDay = startDate.toDateString() === endDate.toDateString();
        
        if (isSameDay) {
            return `${formatDate(event.start_date)} • ${formatTime(event.start_date)} - ${formatTime(event.end_date!)}`;
        } else {
            return `${formatDate(event.start_date)} - ${formatDate(event.end_date!)}`;
        }
    };

    return (
        <div className={`bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 mb-6 ${className}`}>
            {/* Event Image */}
            {event.image && (
                <div className="relative h-48 w-full">
                    <img 
                        src={event.image} 
                        alt={event.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                        }}
                    />
                </div>
            )}
            
            <div className="p-6">
                {/* Event Header */}
                <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {event.name}
                    </h3>
                </div>

                {/* Date and Time */}
                <div className="flex items-center mb-3 text-gray-600">
                    <FiCalendar className="h-4 w-4" />
                    <span className="text-sm font-medium ml-2">{getDateRange()}</span>
                </div>

                {/* Address */}
                {event.address && (
                    <div className="flex items-center mb-3 text-gray-600">
                        <FiMapPin className="h-4 w-4" />
                        <span className="text-sm ml-2">{event.address}</span>
                    </div>
                )}

                {/* Description */}
                {event.description && (
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        {event.description.length > 150 
                            ? `${event.description.substring(0, 150)}...` 
                            : event.description
                        }
                    </p>
                )}

                {/* Event Link */}
                {event.link && (
                    <div className="pt-4 border-t border-gray-100">
                        <Link 
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                        >
                            <FiExternalLink className="h-4 w-4" />
                            <span className="ml-2">Learn More</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}