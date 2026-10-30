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
    // Load the image right away (for the first cards, which are visible without scrolling)
    eager?: boolean;
}

export default function EventCard({ item, now, showOrganization, onShowOnMap, eager = false }: EventCardProps) {
    const { event, organization } = item;
    const [expanded, setExpanded] = useState(false);
    const ongoing = isOngoing(event, now);

    return (
        <article className="flex gap-3 rounded-2xl p-3 transition-colors hover:bg-muted">

            {/* Image */}
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-20">
                {event.image ? (
                    <Image src={event.image} alt="" fill unoptimized sizes="80px" loading={eager ? 'eager' : 'lazy'} className="object-cover" />
                ) : (
                    <CalendarIcon className="absolute inset-0 m-auto size-6 text-fg-muted" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                {showOrganization && (
                    <p className="truncate text-xs font-medium text-fg-muted">{organization.name}</p>
                )}
                <h3 className="line-clamp-2 font-semibold leading-snug text-fg">{event.name}</h3>

                <p className="mt-1 flex items-center gap-1.5 text-sm text-fg-soft">
                    <ClockIcon className="size-3.5 shrink-0" />
                    <span className="tabular-nums">{formatTimeRange(event)}</span>
                    {ongoing && (
                        <span className="rounded-full bg-emerald-50 px-1.5 py-px text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Now</span>
                    )}
                </p>

                {/* Actions */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {event.link && (
                        <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 items-center gap-1 rounded-full bg-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
                        >
                            Event page
                            <ExternalLinkIcon className="size-3.5" />
                        </a>
                    )}
                    {showOrganization && (
                        <button
                            type="button"
                            onClick={onShowOnMap}
                            className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold text-fg-soft ring-1 ring-line ring-inset transition-colors hover:bg-muted"
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
                            className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold text-fg-soft ring-1 ring-line ring-inset transition-colors hover:bg-muted"
                        >
                            {expanded ? 'Less' : 'More'}
                            <ChevronDownIcon className={`size-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>

                {expanded && event.description && (
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-fg-soft">{event.description}</p>
                )}
            </div>
        </article>
    );
}
