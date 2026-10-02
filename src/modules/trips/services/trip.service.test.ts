import type { TripDto } from '@/modules/trips/dto/trip.dto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tripService } from '@/modules/trips/services/trip.service';

const tripDto: TripDto = {
  archivedAt: null,
  createdAt: '2026-07-24T12:00:00.000Z',
  currency: 'CAD',
  description: null,
  endDate: null,
  id: 'trip-1',
  lightweightMode: true,
  ownerId: 'user-1',
  pace: 'BALANCED',
  preferences: {},
  revision: 1,
  startDate: null,
  state: 'DRAFT',
  timezone: 'America/Toronto',
  title: 'Montreal',
  transportMode: 'WALK',
  travellerCount: 1,
  updatedAt: '2026-07-24T12:00:00.000Z',
  viewerCanComment: true,
  viewerCanVote: true,
  visibility: 'PRIVATE',
};

describe('tripService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates a trip through the same-origin BFF', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ data: tripDto }), {
      headers: { 'content-type': 'application/json' },
      status: 201,
    }));
    vi.stubGlobal('fetch', fetchMock);

    const trip = await tripService.create({
      currency: 'CAD',
      flexibleDates: true,
      pace: 'BALANCED',
      timezone: 'America/Toronto',
      title: 'Montreal',
      transportMode: 'WALK',
      travellerCount: 1,
    }, 'user-1');

    expect(trip.id).toBe('trip-1');
    expect(trip.role).toBe('OWNER');

    const [path, request] = fetchMock.mock.calls[0] ?? [];

    expect(path).toBe('/api/trips');
    expect(request?.method).toBe('POST');
    expect(JSON.parse(String(request?.body))).toMatchObject({
      lightweightMode: true,
      title: 'Montreal',
      transportMode: 'WALK',
    });
  });

  it('sends revisions when recalculating', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({
      data: { affectedDayIds: [], calculatedAt: '2026-07-24T12:00:00.000Z', findings: [], routeLegs: [], status: 'COMPLETED', tripRevision: 9 },
    }), {
      headers: { 'content-type': 'application/json' },
      status: 200,
    }));
    vi.stubGlobal('fetch', fetchMock);

    await tripService.recalculate('trip-1', 8);

    const [, request] = fetchMock.mock.calls[0] ?? [];

    expect(request?.method).toBe('POST');
    expect(JSON.parse(String(request?.body))).toEqual({ revision: 8 });
  });
});
