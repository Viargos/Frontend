'use client';

import type { Trip, TripState } from '@/modules/trips/types/trip.types';
import { Plus, Route } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/modules/common/components/ui';
import { TRIP_COPY } from '@/modules/trips/copy/trip.copy';
import { useNetworkStatus } from '@/modules/trips/hooks/use-network-status';
import { useTripList } from '@/modules/trips/hooks/use-trips';
import { CreateTripPanel } from './CreateTripPanel';
import { TripCard } from './TripCard';
import { TripStatePanel } from './TripStatePanel';

const sections: Array<{ states: TripState[]; title: string }> = [
  { states: ['ACTIVE'], title: TRIP_COPY.headings.active },
  { states: ['PLANNING', 'READY'], title: TRIP_COPY.headings.upcoming },
  { states: ['DRAFT'], title: TRIP_COPY.headings.ideas },
  { states: ['COMPLETED', 'PUBLISHED'], title: TRIP_COPY.headings.completed },
  { states: ['ARCHIVED'], title: TRIP_COPY.headings.archived },
];

function Section(props: { title: string; trips: Trip[] }) {
  if (props.trips.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={`trip-section-${props.title.toLowerCase()}`}>
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="font-[Outfit] text-xl font-semibold text-slate-950" id={`trip-section-${props.title.toLowerCase()}`}>{props.title}</h2>
        <span className="text-xs font-semibold text-slate-400">{new Intl.NumberFormat().format(props.trips.length)}</span>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {props.trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
      </div>
    </section>
  );
}

export function TripsPageView() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const online = useNetworkStatus();
  const query = useTripList();

  const errorKind = query.error?.statusCode === 403
    ? 'denied'
    : query.error?.statusCode === 409
      ? 'conflict'
      : 'error';

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_right,rgba(248,215,117,0.16),transparent_26%),linear-gradient(180deg,#f8fafc_0%,#ffffff_42%)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-6xl">
        {!online ? <TripStatePanel kind="offline" /> : null}
        <header className="relative overflow-hidden rounded-[32px] bg-[#160E53] px-6 py-8 text-white shadow-[0_28px_70px_-36px_rgba(22,14,83,0.7)] sm:px-9 sm:py-10">
          <div aria-hidden className="absolute inset-y-0 right-0 hidden w-2/5 items-center lg:flex">
            <svg className="h-full w-full opacity-80" fill="none" viewBox="0 0 500 240">
              <path d="M20 182C116 190 110 52 218 67s111 110 246 37" stroke="#f8d775" strokeDasharray="5 10" strokeLinecap="round" strokeWidth="3" />
              <circle cx="20" cy="182" fill="#160E53" r="8" stroke="white" strokeWidth="3" />
              <circle cx="218" cy="67" fill="#f8d775" r="7" />
              <circle cx="464" cy="104" fill="white" r="8" />
            </svg>
          </div>
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/80">
              <Route aria-hidden className="h-3.5 w-3.5 text-[#f8d775]" />
              {TRIP_COPY.list.routeNote}
            </span>
            <h1 className="mt-5 font-[Outfit] text-3xl font-semibold tracking-tight sm:text-5xl">{TRIP_COPY.headings.trips}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">{TRIP_COPY.list.description}</p>
            <Button className="mt-7 h-11 rounded-full bg-[#f8d775] px-5 font-semibold text-[#160E53] hover:bg-[#ffe69a]" onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden className="mr-2 h-4 w-4" />
              {TRIP_COPY.actions.create}
            </Button>
          </div>
        </header>

        <div className="mt-8 space-y-9">
          {query.isLoading ? <TripStatePanel kind="loading" /> : null}
          {query.error
            ? (
                <TripStatePanel
                  action={<Button onClick={() => query.refetch()}>{TRIP_COPY.actions.refresh}</Button>}
                  kind={errorKind}
                  message={query.error.message}
                />
              )
            : null}
          {!query.isLoading && !query.error && query.trips.length === 0
            ? (
                <TripStatePanel
                  action={<Button onClick={() => setCreateOpen(true)}>{TRIP_COPY.actions.createFirst}</Button>}
                  kind="empty"
                />
              )
            : null}
          {sections.map(section => (
            <Section
              key={section.title}
              title={section.title}
              trips={query.trips.filter(trip => section.states.includes(trip.state))}
            />
          ))}
        </div>
      </div>

      <CreateTripPanel
        isCreating={query.isCreating}
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={async (input) => {
          const trip = await query.createTrip(input);
          router.push(`/plan-your-journey/${trip.id}`);
          return trip;
        }}
      />
    </div>
  );
}
