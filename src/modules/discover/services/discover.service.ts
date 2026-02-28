import type { DiscoverCoordinatesDto, DiscoverJourneyDto } from '@/modules/discover/dto/discover.dto';
import type { DiscoverCoordinates, DiscoverJourney } from '@/modules/discover/types/discover.types';
import { httpClient } from '@/lib/api/http-client';
import { unwrapEnvelope } from '@/modules/common/mappers';
import { DISCOVER_DEFAULT_LIMIT, DISCOVER_DEFAULT_RADIUS_KM } from '@/modules/discover/constants/discover.constants';
import { mapDiscoverJourney } from '@/modules/discover/mappers/discover.mapper';

async function parseEnvelope<T>(path: string): Promise<T> {
  const payload = await httpClient.get<unknown>(path);
  return unwrapEnvelope<T>(payload).data;
}

export const discoverService = {
  async getCurrentLocation(): Promise<DiscoverCoordinates> {
    const location = await parseEnvelope<DiscoverCoordinatesDto>('/location/current');
    return {
      latitude: location.latitude,
      longitude: location.longitude,
    };
  },

  async getNearbyJourneys(input: {
    latitude: number;
    longitude: number;
    radius?: number;
    limit?: number;
  }): Promise<DiscoverJourney[]> {
    const params = new URLSearchParams({
      latitude: String(input.latitude),
      limit: String(input.limit ?? DISCOVER_DEFAULT_LIMIT),
      longitude: String(input.longitude),
      radius: String(input.radius ?? DISCOVER_DEFAULT_RADIUS_KM),
    });

    const journeys = await parseEnvelope<DiscoverJourneyDto[]>(`/journeys/nearby?${params.toString()}`);
    return journeys.map(mapDiscoverJourney);
  },
};
