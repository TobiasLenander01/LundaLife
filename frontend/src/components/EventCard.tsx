import { useState } from 'react';
import Image from 'next/image';
import { EventItem } from '@/types/app';
import { formatTimeRange, isOngoing } from '@/lib/helpers';
import { CalendarIcon, ChevronDownIcon, ClockIcon, ExternalLinkIcon, MapPinIcon } from '@/components/icons';

interface EventCardProps {
    item: EventItem;
    now: Date;
    // Hide the organization name and map button when the list only shows one organization
    showOrganization: boolean;
    onShowOnMap: () => void;
}

export default function EventCard({ item, now, showOrganization, onShowOnMap }: EventCardProps) {
    const { event, organization } = item;
    const [expanded, setExpanded] = useState(false);
    const ongoing = isOngoing(event, now);

    return (
        <article className="flex gap-3 rounded-2xl p-3 transition-colors hover:bg-slate-50">

            {/* Image */}
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:size-20">
                {event.image ? (
                    <Image src={event.image} alt="" fill unoptimized sizes="80px" className="object-cover" />
                ) : (
                    <CalendarIcon className="absolute inset-0 m-auto size-6 text-slate-400" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                {showOrganization && (
                    <p className="truncate text-xs font-medium text-slate-500">{organization.name}</p>
                )}
                <h3 className="line-clamp-2 font-semibold leading-snug text-slate-900">{event.name}</h3>

                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                    <ClockIcon className="size-3.5 shrink-0" />
                    <span className="tabular-nums">{formatTimeRange(event)}</span>
                    {ongoing && (
                        <span className="rounded-full bg-emerald-50 px-1.5 py-px text-xs font-semibold text-emerald-700">Now</span>
                    )}
                </p>

                {/* Actions */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {event.link && (
                        <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 items-center gap-1 rounded-full bg-brand px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-hover"
                        >
                            Event page
                            <ExternalLinkIcon className="size-3.5" />
                        </a>
                    )}
                    {showOrganization && (
                        <button
                            type="button"
                            onClick={onShowOnMap}
                            className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 ring-inset transition-colors hover:bg-slate-100"
                        >
                            <MapPinIcon className="size-3.5" />
                            Map
                        </button>
                    )}
                    {event.description && (
                        <button
                            type="button"
                            onClick={() => setExpanded(!expanded)}
                            aria-expanded={expanded}
                            className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 ring-inset transition-colors hover:bg-slate-100"
                        >
                            {expanded ? 'Less' : 'More'}
                            <ChevronDownIcon className={`size-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>

                {expanded && event.description && (
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{event.description}</p>
                )}
            </div>
        </article>
    );
}
