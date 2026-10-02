import type { Trip, TripState } from '@/modules/trips/types/trip.types';
import { TRIP_COPY } from '@/modules/trips/copy/trip.copy';

const stateLabels: Record<TripState, string> = {
  ACTIVE: TRIP_COPY.labels.active,
  ARCHIVED: TRIP_COPY.labels.archived,
  COMPLETED: TRIP_COPY.labels.completed,
  DRAFT: TRIP_COPY.labels.draft,
  PLANNING: TRIP_COPY.labels.planning,
  PUBLISHED: TRIP_COPY.labels.published,
  READY: TRIP_COPY.labels.ready,
};

export function formatTripDateRange(trip: Pick<Trip, 'endDate' | 'startDate' | 'timezone'>, locale?: string) {
  if (!trip.startDate) {
    return TRIP_COPY.create.flexibleDates;
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: trip.timezone,
    year: 'numeric',
  });
  const start = formatter.format(new Date(`${trip.startDate}T12:00:00Z`));
  const end = trip.endDate ? formatter.format(new Date(`${trip.endDate}T12:00:00Z`)) : undefined;
  return end ? `${start} – ${end}` : start;
}

export function formatTripTimestamp(value: string, timezone: string, locale?: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(new Date(value));
}

export function getTripStateLabel(state: TripState) {
  return stateLabels[state];
}
