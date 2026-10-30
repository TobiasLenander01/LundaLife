'use client';

import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import Brand from '@/components/Brand';
import BottomSheet, { SHEET_TOP_OFFSET, SNAP_POINTS } from '@/components/BottomSheet';
import EventList from '@/components/EventList';
import FilterChips from '@/components/FilterChips';
import ThemeToggle from '@/components/ThemeToggle';
import Map, { MapMarker } from '@/components/Map';
import { isThisMonth, isThisWeek, isToday } from '@/lib/helpers';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { useNow } from '@/lib/useNow';
import { EventItem, FilterOptions, FilterValue } from '@/types/app';
import { Event, Organization } from '@/types/events';

interface ClientProps {
  organizations?: Organization[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

// How each filter is described in sentences, e.g. "No events this week"
const FILTER_PHRASES: Record<FilterValue, string> = {
  'today': 'today',
  'this-week': 'this week',
  'this-month': 'this month',
  'all': 'coming up',
};

const FILTER_TITLES: Record<FilterValue, string> = {
  'today': 'Today',
  'this-week': 'This week',
  'this-month': 'This month',
  'all': 'All upcoming events',
};

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

export default function Client({ organizations = [], loading = false, error = null, onRetry }: ClientProps) {
  const [filter, setFilter] = useState<FilterValue>('today');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINTS[1]);
  const listRef = useRef<HTMLDivElement>(null);
  const now = useNow();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Date check for each filter
  const checks = useMemo<Record<FilterValue, (event: Event) => boolean>>(() => ({
    'today': (event) => isToday(event, now),
    'this-week': (event) => isThisWeek(event, now),
    'this-month': (event) => isThisMonth(event, now),
    'all': () => true,
  }), [now]);

  // Number of events for each filter, shown on the filter chips
  const counts = useMemo(() => {
    const allEvents = organizations.flatMap((org) => org.events ?? []);
    return Object.fromEntries(
      FilterOptions.map((option) => [option.value, allEvents.filter(checks[option.value]).length])
    ) as Record<FilterValue, number>;
  }, [organizations, checks]);

  // Each organization with its events in the selected filter
  const filtered = useMemo(() => organizations.map((organization) => ({
    organization,
    events: (organization.events ?? []).filter(checks[filter]),
  })), [organizations, checks, filter]);

  const selected = organizations.find((org) => org.id === selectedId) ?? null;

  // Show organizations with matching events (or all of them), plus the selected one
  const markers: MapMarker[] = filtered
    .filter(({ organization, events }) => filter === 'all' || events.length > 0 || organization.id === selectedId)
    .map(({ organization, events }) => ({ organization, count: events.length }));

  // Events to list, sorted by start time
  const items: EventItem[] = filtered
    .filter(({ organization }) => !selected || organization.id === selected.id)
    .flatMap(({ organization, events }) => events.map((event) => ({ event, organization })))
    .sort((a, b) => new Date(a.event.start_date).getTime() - new Date(b.event.start_date).getTime());

  const placeCount = new Set(items.map((item) => item.organization.id)).size;

  // Select an organization (or clear the selection) and show its events
  const selectOrganization = (organization: Organization | null, sheetSnap = SNAP_POINTS[1]) => {
    setSelectedId(organization?.id ?? null);
    listRef.current?.scrollTo({ top: 0 });
    if (organization && !isDesktop) {
      setSnap(sheetSnap);
    }
  };

  // Suggest a wider time period when there are no events
  const nextFilter = FilterOptions[FilterOptions.findIndex((option) => option.value === filter) + 1];
  const emptyAction = nextFilter && {
    label: `Show ${nextFilter.label.toLowerCase()}`,
    onClick: () => setFilter(nextFilter.value),
  };

  // Keep the selected marker centered in the part of the map between the top bar and the bottom sheet
  let focusOffsetY = 0;
  if (!isDesktop && typeof window !== 'undefined') {
    const height = window.innerHeight;
    const snapHeight = typeof snap === 'string' ? parseFloat(snap) : (snap ?? 1) * height;
    const sheetTop = SHEET_TOP_OFFSET + height - snapHeight;
    focusOffsetY = height / 2 - (SHEET_TOP_OFFSET + sheetTop) / 2;
  }

  const eventList = (
    <EventList
      title={selected ? selected.name : FILTER_TITLES[filter]}
      subtitle={selected
        ? `${plural(items.length, 'event')} ${FILTER_PHRASES[filter]}`
        : `${plural(items.length, 'event')} at ${plural(placeCount, 'place')}`}
      items={items}
      now={now}
      loading={loading}
      error={error}
      onRetry={onRetry}
      onClearSelection={selected ? () => selectOrganization(null) : undefined}
      // On mobile, collapse the sheet so the map is visible
      onShowOnMap={(organization) => selectOrganization(organization, SNAP_POINTS[0])}
      emptyMessage={selected
        ? `${selected.name} has no events ${FILTER_PHRASES[filter]}.`
        : `No events ${FILTER_PHRASES[filter]}.`}
      emptyAction={emptyAction}
      scrollable={isDesktop || snap === SNAP_POINTS[SNAP_POINTS.length - 1]}
      scrollRef={listRef}
    />
  );

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-canvas">

      {/* Side panel (tablet and desktop) */}
      <aside className="hidden w-[380px] shrink-0 flex-col border-r border-line bg-surface md:flex lg:w-[440px]">
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <Brand showTagline />
            <ThemeToggle />
          </div>
          <FilterChips value={filter} counts={counts} onChange={setFilter} />
        </div>
        {isDesktop && eventList}
      </aside>

      <main className="relative min-w-0 flex-1">
        <Map
          markers={markers}
          selectedId={selectedId}
          onSelect={(organization) => selectOrganization(organization)}
          focusOffsetY={focusOffsetY}
        />

        {/* Floating top bar (mobile) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:hidden">
          <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-raised/95 p-1.5 pl-2 shadow-lg ring-1 ring-black/5 backdrop-blur dark:ring-white/10">
            <Image src="/images/logo.png" alt="LundaLife" width={32} height={32} loading="eager" className="size-8 shrink-0 dark:brightness-0 dark:invert" />
            <div className="min-w-0 flex-1">
              <FilterChips value={filter} counts={counts} onChange={setFilter} />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </main>

      {/* Bottom sheet (mobile) */}
      {!isDesktop && (
        <BottomSheet title={selected ? selected.name : FILTER_TITLES[filter]} snap={snap} onSnapChange={setSnap}>
          {eventList}
        </BottomSheet>
      )}
    </div>
  );
}
