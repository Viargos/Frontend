import { AlertTriangle, CloudOff, LoaderCircle, ShieldX } from 'lucide-react';
import { TRIP_COPY } from '@/modules/trips/copy/trip.copy';

export function TripStatePanel(props: {
  action?: React.ReactNode;
  kind: 'conflict' | 'denied' | 'empty' | 'error' | 'loading' | 'offline';
  message?: string;
}) {
  const Icon = props.kind === 'denied'
    ? ShieldX
    : props.kind === 'offline'
      ? CloudOff
      : props.kind === 'loading'
        ? LoaderCircle
        : AlertTriangle;
  const fallback = {
    conflict: TRIP_COPY.errors.stale,
    denied: TRIP_COPY.errors.denied,
    empty: TRIP_COPY.empty.trips,
    error: TRIP_COPY.errors.generic,
    loading: TRIP_COPY.status.loading,
    offline: TRIP_COPY.errors.offline,
  }[props.kind];

  return (
    <div
      className="flex min-h-56 flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center"
      role={props.kind === 'error' || props.kind === 'conflict' ? 'alert' : 'status'}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#160E53]/8 text-[#160E53]">
        <Icon aria-hidden className={props.kind === 'loading' ? 'h-5 w-5 animate-spin' : 'h-5 w-5'} />
      </span>
      <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">{props.message ?? fallback}</p>
      {props.action ? <div className="mt-5">{props.action}</div> : null}
    </div>
  );
}
