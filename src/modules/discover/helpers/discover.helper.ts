import type { DiscoverJourney, DiscoverJourneyPlace } from '@/modules/discover/types/discover.types';

export function toMapPins(journeys: DiscoverJourney[]): Array<DiscoverJourneyPlace & { journeyId: string; journeyTitle: string }> {
  return journeys.flatMap(journey => journey.places.map(place => ({
    ...place,
    journeyId: journey.id,
    journeyTitle: journey.title,
  })));
}
