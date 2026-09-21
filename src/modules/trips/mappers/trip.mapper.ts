import type { CreateTripDto, TripDto, TripListResultDto } from '@/modules/trips/dto/trip.dto';
import type { CreateTripInput, Trip, TripList } from '@/modules/trips/types/trip.types';

export function mapTrip(dto: TripDto, actorId?: string): Trip {
  const role = dto.ownerId === actorId
    ? 'OWNER'
    : dto.members?.find(member => member.userId === actorId && member.status === 'ACTIVE')?.role ?? 'VIEWER';
  const destinationNames = [...new Set((dto.inboxItems ?? []).map(item => item.placeSnapshot.name).filter(Boolean))];

  return {
    archivedAt: dto.archivedAt ?? undefined,
    createdAt: dto.createdAt,
    currency: dto.currency,
    description: dto.description ?? undefined,
    destinations: destinationNames.map((name, order) => ({ id: name, name, order })),
    endDate: dto.endDate ?? undefined,
    id: dto.id,
    lightweightMode: dto.lightweightMode,
    members: dto.members ?? [],
    pace: dto.pace,
    preferences: dto.preferences,
    revision: dto.revision,
    role,
    startDate: dto.startDate ?? undefined,
    state: dto.state,
    timezone: dto.timezone,
    title: dto.title,
    transportMode: dto.transportMode,
    travellerCount: dto.travellerCount,
    updatedAt: dto.updatedAt,
    viewerCanComment: dto.viewerCanComment,
    viewerCanVote: dto.viewerCanVote,
    visibility: dto.visibility,
  };
}

export function mapTripList(dto: TripListResultDto, actorId?: string): TripList {
  return {
    hasMore: dto.pagination?.hasMore ?? false,
    items: dto.data.map(trip => mapTrip(trip, actorId)),
    nextCursor: dto.pagination?.nextCursor ?? undefined,
  };
}

export function mapCreateTripInput(input: CreateTripInput): CreateTripDto {
  return {
    currency: input.currency,
    description: input.description || undefined,
    endDate: input.flexibleDates ? undefined : input.endDate,
    lightweightMode: input.flexibleDates,
    pace: input.pace,
    startDate: input.flexibleDates ? undefined : input.startDate,
    timezone: input.timezone,
    title: input.title.trim(),
    transportMode: input.transportMode,
    travellerCount: input.travellerCount,
  };
}
