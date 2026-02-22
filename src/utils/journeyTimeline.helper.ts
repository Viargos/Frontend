import { CreateJourneyPlace } from '@/types/journey.types';
import { getDurationInMinutes, addMinutesToTime } from './time.utils';

/**
 * Recalculates timeline for a single day's places.
 * Pure function: does not mutate the input array; returns a new array.
 *
 * @param places - Array of places to recalculate (order matters)
 * @param baseStartTime - Starting time for first activity (default: "09:00")
 * @returns New array with recalculated times (fully immutable)
 *
 * Respects:
 * - Manual start times (hasManualStart)
 * - Manual end times (hasManualEnd)
 * - Original duration intent (preserves user-set activity length)
 *
 * Safety:
 * - Guards against negative duration (min 15 min)
 * - Fully immutable (no side effects)
 */
export function recalculateDayTimeline(
  places: CreateJourneyPlace[],
  baseStartTime: string = '09:00'
): CreateJourneyPlace[] {
  if (!places.length) return places;

  const updated = places.map((place) => ({ ...place }));
  let currentTime = baseStartTime;

  for (let i = 0; i < updated.length; i++) {
    const place = updated[i];

    // Calculate duration (already guarded by getDurationInMinutes with min 15 min)
    const duration = getDurationInMinutes(place.startTime, place.endTime);

    // Handle start time
    if (place.hasManualStart) {
      currentTime = place.startTime;
    } else {
      place.startTime = currentTime;
    }

    // Handle end time
    if (place.hasManualEnd) {
      currentTime = place.endTime;
    } else {
      const calculatedEnd = addMinutesToTime(place.startTime, duration);
      place.endTime = calculatedEnd;
      currentTime = calculatedEnd;
    }
  }

  return updated;
}
