import type { Trip, TripWorkspaceData } from '@/modules/trips/types/trip.types';
import { expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { TRIP_COPY } from '@/modules/trips/copy/trip.copy';
import { TripWorkspaceContent } from './TripWorkspaceContent';

const trip: Trip = {
  createdAt: '2026-07-24T12:00:00.000Z',
  currency: 'CAD',
  destinations: [],
  id: 'trip-1',
  lightweightMode: false,
  members: [],
  pace: 'BALANCED',
  preferences: {},
  revision: 1,
  role: 'VIEWER',
  state: 'ACTIVE',
  timezone: 'America/Toronto',
  title: 'Montreal',
  transportMode: 'WALK',
  travellerCount: 1,
  updatedAt: '2026-07-24T12:00:00.000Z',
  viewerCanComment: true,
  viewerCanVote: true,
  visibility: 'SHARED',
};

const data: TripWorkspaceData = {
  activity: { data: [], pagination: { hasMore: false, nextCursor: null } },
  comments: [],
  days: [],
  findings: [],
  inbox: [],
  items: [{
    createdAt: '2026-07-24T12:00:00.000Z',
    dayId: 'day-1',
    durationMinutes: null,
    endTime: null,
    id: 'item-1',
    inboxItemId: null,
    isAnchor: false,
    isLocked: false,
    notes: null,
    revision: 1,
    sequence: 1,
    startTime: null,
    status: 'PLANNED',
    title: 'Old Montreal walk',
    tripId: 'trip-1',
    type: 'ACTIVITY',
    updatedAt: '2026-07-24T12:00:00.000Z',
  }],
  members: [],
  proposals: [],
  routeLegs: [],
  votes: [],
};

it('denies viewer live mutations', async () => {
  const screen = await render(
    <TripWorkspaceContent
      actions={{
        applyProposal: vi.fn(),
        isPending: false,
        publishDraft: vi.fn(),
        recalculate: vi.fn(),
        recordActual: vi.fn(),
        startLive: vi.fn(),
      }}
      data={data}
      tab="live"
      trip={trip}
    />,
  );

  await expect.element(screen.getByRole('button', { name: TRIP_COPY.actions.markComplete })).toBeDisabled();
  await expect.element(screen.getByRole('button', { name: TRIP_COPY.actions.startLive })).toBeDisabled();
});
