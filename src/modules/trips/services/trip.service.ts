import type {
  ActivityResultDto,
  CreateTripDto,
  JourneyImportResultDto,
  RecordActualResultDto,
  TripCommentDto,
  TripDayDto,
  TripDto,
  TripFindingDto,
  TripInboxItemDto,
  TripInvitationResultDto,
  TripItemDto,
  TripListResultDto,
  TripMemberDto,
  TripOfflineSnapshotDto,
  TripProposalDto,
  TripPublishDraftDto,
  TripReadinessDto,
  TripRouteLegDto,
  TripVoteDto,
} from '@/modules/trips/dto/trip.dto';
import type {
  CreateTripInput,
  InboxFilters,
  RecordActualInput,
  Trip,
  TripList,
} from '@/modules/trips/types/trip.types';
import { httpClient } from '@/lib/api/http-client';
import { mapCreateTripInput, mapTrip, mapTripList } from '@/modules/trips/mappers/trip.mapper';

type DataEnvelope<T> = { data: T };
type MutationResult<T> = { tripRevision: number } & T;

function createIdempotencyKey(operation: string) {
  return `${operation}-${crypto.randomUUID()}`;
}

async function requestData<T>(options: {
  body?: object;
  idempotencyKey?: string;
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST';
  path: string;
  query?: Record<string, boolean | number | string | undefined>;
}) {
  const headers = new Headers();
  if (options.idempotencyKey) {
    headers.set('Idempotency-Key', options.idempotencyKey);
  }

  const response = await httpClient.request<DataEnvelope<T>>(options.path, {
    body: options.body ? JSON.stringify(options.body) : null,
    headers,
    method: options.method ?? 'GET',
    query: options.query,
  });
  return response.data;
}

export const tripService = {
  activity: (tripId: string) => requestData<ActivityResultDto>({ path: `/trips/${tripId}/activity` }),
  comments: (tripId: string) => requestData<TripCommentDto[]>({ path: `/trips/${tripId}/comments` }),
  days: (tripId: string) => requestData<TripDayDto[]>({ path: `/trips/${tripId}/days` }),
  findings: (tripId: string) => requestData<TripFindingDto[]>({ path: `/trips/${tripId}/findings` }),
  items: (tripId: string) => requestData<TripItemDto[]>({ path: `/trips/${tripId}/items` }),
  members: (tripId: string) => requestData<TripMemberDto[]>({ path: `/trips/${tripId}/members` }),
  offlineSnapshot: (tripId: string) => requestData<TripOfflineSnapshotDto>({ path: `/trips/${tripId}/offline-snapshot` }),
  proposals: (tripId: string) => requestData<TripProposalDto[]>({ path: `/trips/${tripId}/proposals` }),
  readiness: (tripId: string) => requestData<TripReadinessDto>({ path: `/trips/${tripId}/readiness` }),
  votes: (tripId: string) => requestData<TripVoteDto[]>({ path: `/trips/${tripId}/votes` }),

  async create(input: CreateTripInput, actorId?: string): Promise<Trip> {
    const body: CreateTripDto = mapCreateTripInput(input);
    const dto = await requestData<TripDto>({ body, method: 'POST', path: '/trips' });
    return mapTrip(dto, actorId);
  },

  async get(tripId: string, actorId?: string): Promise<Trip> {
    return mapTrip(await requestData<TripDto>({ path: `/trips/${tripId}` }), actorId);
  },

  async list(actorId?: string, cursor?: string): Promise<TripList> {
    const result = await requestData<TripListResultDto>({
      path: '/trips',
      query: { cursor, limit: 100 },
    });
    return mapTripList(result, actorId);
  },

  inbox(tripId: string, filters?: InboxFilters) {
    return requestData<TripInboxItemDto[]>({
      path: `/trips/${tripId}/inbox`,
      query: filters,
    });
  },

  importJourney(options: {
    revision: number;
    selectedDayIds?: string[];
    selectedItemIds?: string[];
    sourceJourneyId: string;
    tripId: string;
  }) {
    return requestData<JourneyImportResultDto>({
      body: {
        revision: options.revision,
        selectedDayIds: options.selectedDayIds,
        selectedItemIds: options.selectedItemIds,
        sourceJourneyId: options.sourceJourneyId,
      },
      idempotencyKey: createIdempotencyKey('journey-import'),
      method: 'POST',
      path: `/trips/${options.tripId}/inbox/import`,
    });
  },

  updateInbox(options: {
    itemId: string;
    notes?: string;
    priority?: number;
    revision: number;
    tags?: string[];
    tripId: string;
  }) {
    return requestData<MutationResult<{ item: TripInboxItemDto }>>({
      body: {
        notes: options.notes,
        priority: options.priority,
        revision: options.revision,
        tags: options.tags,
      },
      method: 'PATCH',
      path: `/trips/${options.tripId}/inbox/${options.itemId}`,
    });
  },

  bulkInbox(options: {
    itemIds: string[];
    operation: 'ADD_TAG' | 'REMOVE' | 'SET_PRIORITY';
    priority?: number;
    revision: number;
    tag?: string;
    tripId: string;
  }) {
    return requestData<MutationResult<{ updatedItemIds: string[] }>>({
      body: {
        itemIds: options.itemIds,
        operation: options.operation,
        priority: options.priority,
        revision: options.revision,
        tag: options.tag,
      },
      method: 'POST',
      path: `/trips/${options.tripId}/inbox/bulk`,
    });
  },

  mergeInbox(options: {
    duplicateItemIds: string[];
    primaryItemId: string;
    revision: number;
    tripId: string;
  }) {
    return requestData<MutationResult<{ mergedItemIds: string[]; primary: TripInboxItemDto }>>({
      body: {
        duplicateItemIds: options.duplicateItemIds,
        primaryItemId: options.primaryItemId,
        revision: options.revision,
      },
      method: 'POST',
      path: `/trips/${options.tripId}/inbox/merge`,
    });
  },

  createDay(options: {
    localDate?: string;
    revision: number;
    title?: string;
    tripId: string;
  }) {
    return requestData<MutationResult<{ day: TripDayDto }>>({
      body: {
        localDate: options.localDate,
        revision: options.revision,
        title: options.title,
      },
      method: 'POST',
      path: `/trips/${options.tripId}/days`,
    });
  },

  createItem(options: {
    dayId: string;
    durationMinutes?: number;
    inboxItemId?: string;
    revision: number;
    startTime?: string;
    title: string;
    tripId: string;
    type: TripItemDto['type'];
  }) {
    return requestData<MutationResult<{ item: TripItemDto }>>({
      body: {
        dayId: options.dayId,
        durationMinutes: options.durationMinutes,
        inboxItemId: options.inboxItemId,
        revision: options.revision,
        startTime: options.startTime,
        title: options.title,
        type: options.type,
      },
      method: 'POST',
      path: `/trips/${options.tripId}/items`,
    });
  },

  reorderItems(options: {
    items: Array<{ dayId: string; itemId: string; sequence: number }>;
    revision: number;
    tripId: string;
  }) {
    return requestData<MutationResult<{ items: TripItemDto[] }>>({
      body: { items: options.items, revision: options.revision },
      method: 'POST',
      path: `/trips/${options.tripId}/items/reorder`,
    });
  },

  recalculate(tripId: string, revision: number) {
    return requestData<{
      affectedDayIds: string[];
      calculatedAt: string;
      findings: TripFindingDto[];
      routeLegs: TripRouteLegDto[];
      status: 'COMPLETED';
      tripRevision: number;
    }>({
      body: { revision },
      method: 'POST',
      path: `/trips/${tripId}/recalculate`,
    });
  },

  resolveFinding(options: {
    action: 'OVERRIDE' | 'RESOLVE';
    findingId: string;
    reason: string;
    revision: number;
    tripId: string;
  }) {
    return requestData<MutationResult<{ finding: TripFindingDto }>>({
      body: {
        action: options.action,
        reason: options.reason,
        revision: options.revision,
      },
      method: 'POST',
      path: `/trips/${options.tripId}/findings/${options.findingId}/resolve`,
    });
  },

  applyProposal(options: {
    proposalId: string;
    revision: number;
    selectedOperationIndexes?: number[];
    tripId: string;
  }) {
    return requestData<{
      affectedEntityIds: string[];
      appliedOperationIndexes: number[];
      proposal: TripProposalDto;
      tripRevision: number;
    }>({
      body: {
        revision: options.revision,
        selectedOperationIndexes: options.selectedOperationIndexes,
      },
      method: 'POST',
      path: `/trips/${options.tripId}/proposals/${options.proposalId}/apply`,
    });
  },

  inviteMember(options: {
    email: string;
    revision: number;
    role: 'EDITOR' | 'VIEWER';
    tripId: string;
  }) {
    return requestData<TripInvitationResultDto>({
      body: {
        email: options.email,
        revision: options.revision,
        role: options.role,
      },
      method: 'POST',
      path: `/trips/${options.tripId}/members`,
    });
  },

  createVote(options: {
    revision: number;
    targetId: string;
    targetType: 'INBOX_ITEM' | 'ITEM' | 'PROPOSAL';
    tripId: string;
    value: -1 | 1;
  }) {
    return requestData<MutationResult<{ vote: TripVoteDto }>>({
      body: {
        revision: options.revision,
        targetId: options.targetId,
        targetType: options.targetType,
        value: options.value,
      },
      method: 'POST',
      path: `/trips/${options.tripId}/votes`,
    });
  },

  createComment(options: {
    body: string;
    revision: number;
    targetId?: string;
    targetType: 'INBOX_ITEM' | 'ITEM' | 'PROPOSAL' | 'TRIP';
    tripId: string;
  }) {
    return requestData<MutationResult<{ comment: TripCommentDto }>>({
      body: {
        body: options.body,
        revision: options.revision,
        targetId: options.targetId,
        targetType: options.targetType,
      },
      method: 'POST',
      path: `/trips/${options.tripId}/comments`,
    });
  },

  startLive(tripId: string, revision: number, actorId?: string) {
    return requestData<TripDto>({
      body: { revision },
      method: 'POST',
      path: `/trips/${tripId}/live/start`,
    }).then(dto => mapTrip(dto, actorId));
  },

  recordActual(options: { revision: number; tripId: string } & RecordActualInput) {
    return requestData<RecordActualResultDto>({
      body: {
        actualEndAt: options.actualEndAt,
        actualStartAt: options.actualStartAt,
        notes: options.notes,
        revision: options.revision,
        status: options.status,
      },
      idempotencyKey: createIdempotencyKey('item-actual'),
      method: 'POST',
      path: `/trips/${options.tripId}/items/${options.itemId}/actual`,
    });
  },

  publishDraft(tripId: string, revision: number, title?: string) {
    return requestData<TripPublishDraftDto>({
      body: { revision, title },
      idempotencyKey: createIdempotencyKey('publish-draft'),
      method: 'POST',
      path: `/trips/${tripId}/publish-draft`,
    });
  },
};
