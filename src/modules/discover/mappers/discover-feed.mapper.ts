import type { DiscoverFeedItem } from '@/modules/discover/types/discover-ui.types';
import type { DiscoverJourney } from '@/modules/discover/types/discover.types';

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function buildLocationLabel(journey: DiscoverJourney) {
  const namedPlaces = journey.places
    .map(place => place.name?.trim())
    .filter((name): name is string => Boolean(name));
  const primaryLocation = namedPlaces[0];

  if (!primaryLocation) {
    return 'Location coming soon';
  }

  if (namedPlaces.length === 1) {
    return primaryLocation;
  }

  return `${primaryLocation} +${namedPlaces.length - 1} more`;
}

function buildTags(journey: DiscoverJourney) {
  const uniqueTypes = Array.from(
    new Set(
      journey.places
        .map(place => place.type?.trim())
        .filter((type): type is string => Boolean(type)),
    ),
  );

  return uniqueTypes.slice(0, 3).map(toTitleCase);
}

function findPrimaryCoordinates(journey: DiscoverJourney) {
  const primaryPlace = journey.places.find(
    place => Number.isFinite(place.latitude) && Number.isFinite(place.longitude),
  );

  if (primaryPlace?.latitude === undefined || primaryPlace.longitude === undefined) {
    return null;
  }

  return {
    latitude: primaryPlace.latitude,
    longitude: primaryPlace.longitude,
  };
}

export function mapDiscoverJourneyToFeedItem(journey: DiscoverJourney): DiscoverFeedItem | null {
  const coordinates = findPrimaryCoordinates(journey);

  if (!coordinates) {
    return null;
  }

  return {
    createdAt: journey.createdAt,
    creator: journey.creator
      ? {
          avatarUrl: journey.creator.avatarUrl,
          id: journey.creator.id,
          name: journey.creator.name,
        }
      : {
          id: `journey-${journey.id}`,
          name: 'Traveler',
        },
    id: journey.id,
    imageUrl: journey.coverImage,
    journeyId: journey.id,
    latitude: coordinates.latitude,
    locationLabel: buildLocationLabel(journey),
    longitude: coordinates.longitude,
    subtitle: journey.description,
    tags: buildTags(journey),
    title: journey.title,
    type: 'journey',
  };
}

export function mapDiscoverFeedItems(journeys: DiscoverJourney[]) {
  return journeys
    .map(mapDiscoverJourneyToFeedItem)
    .filter((item): item is DiscoverFeedItem => item !== null);
}
