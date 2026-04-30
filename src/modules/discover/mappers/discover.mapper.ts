import type { DiscoverJourneyDto } from '@/modules/discover/dto/discover.dto';
import type { DiscoverJourney, DiscoverJourneyCreator } from '@/modules/discover/types/discover.types';

function toNumber(value: number | string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function mapUserToCreator(dto: DiscoverJourneyDto): DiscoverJourneyCreator | undefined {
  const user = dto.user;
  if (!user?.id) {
    return undefined;
  }

  const name = user.username?.trim() || 'Traveler';

  return {
    avatarUrl: user.profileImage,
    id: user.id,
    name,
  };
}

export function mapDiscoverJourney(dto: DiscoverJourneyDto): DiscoverJourney {
  return {
    coverImage: dto.coverImage,
    createdAt: dto.createdAt,
    creator: mapUserToCreator(dto),
    description: dto.description,
    id: dto.id,
    places: (dto.days ?? []).flatMap(day => (day.places ?? []).map(place => ({
      id: place.id,
      latitude: toNumber(place.latitude),
      longitude: toNumber(place.longitude),
      name: place.name,
      type: place.type,
    }))),
    title: dto.title,
  };
}
