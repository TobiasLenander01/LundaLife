import { Event } from '@/types/app';
import Link from 'next/link';
import Image from 'next/image';
import { FiCalendar, FiMapPin, FiExternalLink, FiClock } from 'react-icons/fi';

interface EventCardProps {
    event: Event;
}

export default function EventCard({ event }: EventCardProps) {

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCategoryBadge = () => {
        if (!event.category) return null;

        const getCategoryStyles = (category: string) => {
            switch (category.toLowerCase()) {
                case 'breakfast':
                    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                case 'lunch':
                    return 'bg-green-100 text-green-800 border-green-200';
                case 'bar':
                    return 'bg-purple-100 text-purple-800 border-purple-200';
                case 'club':
                    return 'bg-pink-100 text-pink-800 border-pink-200';
                default:
                    return 'bg-gray-100 text-gray-800 border-gray-200';
            }
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium border ${getCategoryStyles(event.category)}`}>
                {event.category}
            </span>
        );
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('sv-SE', {
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
            return formatDate(event.start_date);
        } else {
            return `${formatDate(event.start_date)} - ${formatDate(event.end_date!)}`;
        }
    };

    const getTimeRange = () => {
        const endDate = event.end_date ? new Date(event.end_date) : null;
        
        if (!endDate) {
            return formatTime(event.start_date);
        }
        
        const startDate = new Date(event.start_date);
        const isSameDay = startDate.toDateString() === endDate.toDateString();
        
        if (isSameDay) {
            return `${formatTime(event.start_date)} - ${formatTime(event.end_date!)}`;
        } else {
            // For multi-day events, show start time on first day
            return formatTime(event.start_date);
        }
    };

    return (
        <div className={`bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 mb-6`}>
            {/* Event Image */}
            {event.image && (
                <div className="relative h-48 w-full">
                    <Image 
                        src={event.image} 
                        alt={event.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                        }}
                    />
                </div>
            )}
            
            <div className="p-6">
                {/* Event Header with Category */}
                <div className="mb-3">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight flex-1 mr-3">
                            {event.name}
                        </h3>
                        {getCategoryBadge()}
                    </div>
                </div>

                {/* Date */}
                <div className="flex items-center mb-3 text-gray-600">
                    <FiCalendar className="h-4 w-4" />
                    <span className="text-sm font-medium ml-2">{getDateRange()}</span>
                </div>

                {/* Time */}
                <div className="flex items-center mb-3 text-gray-600">
                    <FiClock className="h-4 w-4" />
                    <span className="text-sm ml-2">{getTimeRange()}</span>
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
                            className="inline-flex items-center px-4 py-2 text-blue-700 text-sm font-medium"
                        >
                            <FiExternalLink className="h-4 w-4" />
                            <span className="ml-2">Details</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}