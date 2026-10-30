import { RefObject } from 'react';
import EventCard from '@/components/EventCard';
import { CalendarIcon, CloseIcon } from '@/components/icons';
import { formatDayHeading, getListDay } from '@/lib/helpers';
import { EventItem } from '@/types/app';
import { Organization } from '@/types/database';

interface EventListProps {
    title: string;
    subtitle: string;
    items: EventItem[];
    now: Date;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    // Set when the list shows a single organization
    onClearSelection?: () => void;
    onShowOnMap: (organization: Organization) => void;
    emptyMessage: string;
    emptyAction?: { label: string; onClick: () => void };
    // The bottom sheet only allows scrolling when fully expanded
    scrollable?: boolean;
    scrollRef?: RefObject<HTMLDivElement | null>;
}

export default function EventList({
    title,
    subtitle,
    items,
    now,
    loading = false,
    error = null,
    onRetry,
    onClearSelection,
    onShowOnMap,
    emptyMessage,
    emptyAction,
    scrollable = true,
    scrollRef,
}: EventListProps) {

    // Group events by the day they are listed under
    const groups = new Map<string, EventItem[]>();
    for (const item of items) {
        const day = getListDay(item.event, now);
        groups.set(day, [...(groups.get(day) ?? []), item]);
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col">

            {/* Header */}
            <header className="flex items-start justify-between gap-3 px-4 pb-3">
                <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
                    <p className="text-sm text-slate-500">{loading ? 'Loading events…' : subtitle}</p>
                </div>
                {onClearSelection && (
                    <button
                        type="button"
                        onClick={onClearSelection}
                        aria-label="Show all organizations"
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                    >
                        <CloseIcon className="size-4" />
                    </button>
                )}
            </header>

            {/* List */}
            <div
                ref={scrollRef}
                className={`min-h-0 flex-1 px-1 pb-[max(1rem,env(safe-area-inset-bottom))] ${scrollable ? 'overflow-y-auto overscroll-contain' : 'overflow-hidden'}`}
            >
                {loading ? (
                    <ListSkeleton />
                ) : error ? (
                    <EmptyState message={error} action={onRetry && { label: 'Try again', onClick: onRetry }} />
                ) : items.length === 0 ? (
                    <EmptyState message={emptyMessage} action={emptyAction} />
                ) : (
                    [...groups].map(([day, dayItems]) => (
                        <section key={day} aria-label={formatDayHeading(day, now)}>
                            <h3 className="sticky top-0 z-10 bg-white/95 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 backdrop-blur">
                                {formatDayHeading(day, now)}
                            </h3>
                            {dayItems.map((item) => (
                                <EventCard
                                    key={`${item.organization.id}-${item.event.id}`}
                                    item={item}
                                    now={now}
                                    showOrganization={!onClearSelection}
                                    onShowOnMap={() => onShowOnMap(item.organization)}
                                />
                            ))}
                        </section>
                    ))
                )}
            </div>
        </div>
    );
}

function EmptyState({ message, action }: { message: string; action?: { label: string; onClick: () => void } }) {
    return (
        <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-100">
                <CalendarIcon className="size-6 text-slate-400" />
            </div>
            <p className="mt-3 text-sm text-slate-600">{message}</p>
            {action && (
                <button
                    type="button"
                    onClick={action.onClick}
                    className="mt-4 h-9 rounded-full bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}

function ListSkeleton() {
    return (
        <div aria-hidden="true" className="animate-pulse">
            <div className="mx-3 my-3 h-3 w-20 rounded bg-slate-200" />
            {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex gap-3 p-3">
                    <div className="size-16 shrink-0 rounded-xl bg-slate-200 sm:size-20" />
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 w-24 rounded bg-slate-200" />
                        <div className="h-4 w-4/5 rounded bg-slate-200" />
                        <div className="h-3 w-28 rounded bg-slate-200" />
                    </div>
                </div>
            ))}
        </div>
    );
}
