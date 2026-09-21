import type { TripDto } from '@/modules/trips/dto/trip.dto';
import { describe, expect, it } from 'vitest';
import { mapCreateTripInput, mapTrip, mapTripList } from '@/modules/trips/mappers/trip.mapper';

const dto: TripDto = {
  archivedAt: null,
  createdAt: '2026-07-24T12:00:00.000Z',
  currency: 'CAD',
  description: null,
  endDate: '2027-06-10',
  id: 'trip-1',
  lightweightMode: false,
  ownerId: 'user-1',
  pace: 'BALANCED',
  preferences: {},
  revision: 4,
  startDate: '2027-06-01',
  state: 'PLANNING',
  timezone: 'Europe/Lisbon',
  title: 'Portugal',
  transportMode: 'TRANSIT',
  travellerCount: 2,
  updatedAt: '2026-07-24T12:00:00.000Z',
  viewerCanComment: true,
  viewerCanVote: true,
  visibility: 'PRIVATE',
};

describe('trip mapper', () => {
  it('derives owner access from the signed-in user', () => {
    const trip = mapTrip(dto, 'user-1');

    expect(trip.role).toBe('OWNER');
    expect(mapTrip(dto, 'user-2').role).toBe('VIEWER');
  });

  it('preserves pagination and access in trip lists', () => {
    const trips = mapTripList({
      data: [dto],
      pagination: { hasMore: true, nextCursor: 'next-trip' },
    }, 'user-1');

    expect(trips.hasMore).toBe(true);
    expect(trips.nextCursor).toBe('next-trip');
    expect(trips.items[0]?.role).toBe('OWNER');
  });

  it('removes dates from flexible input', () => {
    const input = mapCreateTripInput({
      currency: 'CAD',
      endDate: '2027-06-10',
      flexibleDates: true,
      pace: 'BALANCED',
      startDate: '2027-06-01',
      timezone: 'America/Toronto',
      title: '  Flexible trip  ',
      transportMode: 'WALK',
      travellerCount: 1,
    });

    expect(input).toMatchObject({
      endDate: undefined,
      lightweightMode: true,
      startDate: undefined,
      title: 'Flexible trip',
    });
  });
});
