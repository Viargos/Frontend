import type { Trip } from '@/modules/trips/types/trip.types';
import { ArrowUpRight, CalendarDays, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/modules/common/components/ui';
import { TRIP_COPY } from '@/modules/trips/copy/trip.copy';
import { formatTripDateRange, getTripStateLabel } from '@/modules/trips/helpers/trip-format';

export function TripCard(props: { trip: Trip }) {
  return (
    <article className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-36px_rgba(22,14,83,0.45)] transition hover:-translate-y-0.5 hover:border-[#160E53]/25 sm:p-6">
      <div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-[#f8d775] to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{getTripStateLabel(props.trip.state)}</Badge>
            <Badge variant="muted">{TRIP_COPY.labels[props.trip.role.toLowerCase() as 'editor' | 'owner' | 'viewer']}</Badge>
          </div>
          <h3 className="mt-4 truncate font-[Outfit] text-xl font-semibold tracking-tight text-slate-950">{props.trip.title}</h3>
          {props.trip.description ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{props.trip.description}</p> : null}
        </div>
        <Link
          aria-label={`${TRIP_COPY.actions.open}: ${props.trip.title}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-[#160E53] transition group-hover:border-[#160E53] group-hover:bg-[#160E53] group-hover:text-white"
          href={`/plan-your-journey/${props.trip.id}`}
        >
          <ArrowUpRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>

      <div aria-hidden className="my-5 flex items-center">
        <span className="h-2.5 w-2.5 rounded-full border-2 border-[#160E53] bg-white" />
        <span className="h-px flex-1 bg-linear-to-r from-[#160E53] via-[#f8d775] to-slate-200" />
        {(props.trip.destinations.length > 0 ? props.trip.destinations.slice(0, 3) : [{ id: 'open', name: '', order: 0 }]).map(destination => (
          <span className="ml-1 h-2 w-2 rounded-full bg-[#f8d775] ring-2 ring-[#f8d775]/25" key={destination.id} />
        ))}
      </div>

      <dl className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <CalendarDays aria-hidden className="h-4 w-4 text-[#160E53]/70" />
          <dd>{formatTripDateRange(props.trip)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Users aria-hidden className="h-4 w-4 text-[#160E53]/70" />
          <dd>
            {new Intl.NumberFormat().format(props.trip.travellerCount)}
            {' '}
            {TRIP_COPY.create.travellers.toLowerCase()}
          </dd>
        </div>
        {props.trip.destinations[0]
          ? (
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin aria-hidden className="h-4 w-4 text-[#160E53]/70" />
                <dd className="truncate">{props.trip.destinations.map(destination => destination.name).join(' · ')}</dd>
              </div>
            )
          : null}
      </dl>
    </article>
  );
}
