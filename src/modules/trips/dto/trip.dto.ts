export type TripStateDto = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'DRAFT' | 'PLANNING' | 'PUBLISHED' | 'READY';
export type TripRoleDto = 'EDITOR' | 'OWNER' | 'VIEWER';
export type TripMemberStatusDto = 'ACTIVE' | 'EXPIRED' | 'INVITED' | 'REMOVED';
export type TripPaceDto = 'BALANCED' | 'FAST' | 'RELAXED';
export type TripTransportModeDto = 'BICYCLE' | 'DRIVE' | 'MIXED' | 'TRANSIT' | 'WALK';
export type TripItemTypeDto = 'ACTIVITY' | 'FOOD' | 'NOTE' | 'STAY' | 'TRANSPORT';
export type TripInboxStatusDto = 'INBOX' | 'MERGED' | 'REMOVED' | 'SCHEDULED';
export type TripActualStatusDto = 'COMPLETED' | 'DELAYED' | 'RESCHEDULED' | 'SKIPPED';

export type UserSummaryDto = {
  id: string;
  email?: string;
  username?: string;
};

export type TripMemberDto = {
  id: string;
  tripId: string;
  userId: string | null;
  user?: UserSummaryDto | null;
  role: TripRoleDto;
  status: TripMemberStatusDto;
  expiresAt?: string | null;
  joinedAt?: string | null;
  removedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TripPlaceSnapshotDto = {
  name: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  type: TripItemTypeDto;
  startTime: string | null;
  endTime: string | null;
};

export type TripProvenanceSnapshotDto = {
  journeyId: string;
  journeyTitle: string;
  journeyVersion: string;
  journeyUpdatedAt: string;
  dayId: string;
  dayNumber: number;
  itemId: string;
  creator: {
    id: string;
    username: string;
  };
};

export type TripInboxItemDto = {
  id: string;
  tripId: string;
  sourceType: 'JOURNEY' | 'MANUAL' | 'PLACE';
  sourceId: string | null;
  sourceJourneyId: string | null;
  sourceJourneyVersion: string | null;
  provenanceSnapshot: TripProvenanceSnapshotDto | null;
  placeSnapshot: TripPlaceSnapshotDto;
  attribution: string | null;
  duplicateFingerprint: string;
  priority: number;
  tags: string[];
  notes: string | null;
  status: TripInboxStatusDto;
  createdAt: string;
  updatedAt: string;
};

export type TripItemDto = {
  id: string;
  tripId: string;
  dayId: string;
  inboxItemId: string | null;
  inboxItem?: TripInboxItemDto | null;
  type: TripItemTypeDto;
  title: string;
  sequence: number;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number | null;
  status: 'COMPLETED' | 'PLANNED' | 'SKIPPED';
  isAnchor: boolean;
  isLocked: boolean;
  notes: string | null;
  revision: number;
  createdAt: string;
  updatedAt: string;
};

export type TripDayDto = {
  id: string;
  tripId: string;
  sequence: number;
  localDate: string | null;
  timezone: string;
  title: string | null;
  isLocked: boolean;
  items?: TripItemDto[];
  createdAt: string;
  updatedAt: string;
};

export type TripDto = {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  state: TripStateDto;
  visibility: 'PRIVATE' | 'SHARED';
  previousState?: TripStateDto | null;
  startDate: string | null;
  endDate: string | null;
  timezone: string;
  currency: string;
  travellerCount: number;
  pace: TripPaceDto;
  transportMode: TripTransportModeDto;
  preferences: Record<string, boolean | number | string>;
  viewerCanVote: boolean;
  viewerCanComment: boolean;
  lightweightMode: boolean;
  revision: number;
  archivedAt: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  members?: TripMemberDto[];
  days?: TripDayDto[];
  inboxItems?: TripInboxItemDto[];
};

export type TripListResultDto = {
  data: TripDto[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
  };
};

export type CreateTripDto = {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  timezone: string;
  currency: string;
  travellerCount: number;
  lightweightMode: boolean;
  pace: TripPaceDto;
  transportMode: TripTransportModeDto;
};

export type JourneyImportResultDto = {
  importedItems: TripInboxItemDto[];
  exactDuplicates: Array<{
    sourceItemId: string;
    existingInboxItemId: string;
    duplicateFingerprint: string;
  }>;
  tripRevision: number;
};

export type TripRouteLegDto = {
  id: string;
  tripId: string;
  dayId: string;
  fromItemId: string;
  toItemId: string;
  mode: TripTransportModeDto;
  durationMinutes: number | null;
  distanceMetres: number | null;
  provider: string;
  quality: 'MANUAL_REQUIRED' | 'STRAIGHT_LINE_ESTIMATE';
  retrievedAt: string;
  isStale: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TripFindingDto = {
  id: string;
  tripId: string;
  rule: 'ANCHOR_CONFLICT' | 'INSUFFICIENT_TRANSFER' | 'MISSING_LOCATION' | 'TIME_OVERLAP';
  severity: 'CRITICAL' | 'INFO' | 'WARNING';
  isBlocking: boolean;
  affectedEntityIds: string[];
  evidence: Record<string, unknown>;
  state: 'OPEN' | 'OVERRIDDEN' | 'RESOLVED';
  resolutionReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TripReadinessDto = {
  score: number;
  threshold: number;
  ready: boolean;
  blockingFindingIds: string[];
  factors: Array<{
    key: 'CONFLICTS' | 'DATES' | 'LOCATIONS' | 'SCHEDULE';
    earned: number;
    possible: number;
    explanation: string;
  }>;
  calculatedAt: string;
  disclaimer: string;
};

export type ProposalPreconditionDto = {
  entityId: string;
  expectedRevision?: number;
  expectedDayId?: string;
};

type ProposalOperationBaseDto = {
  rationale: string;
  expectedEffect: string;
  preconditions: ProposalPreconditionDto[];
};

export type TripProposalOperationDto
  = | (ProposalOperationBaseDto & {
    type: 'ADD_BACKUP' | 'ADD_ITEM';
    dayId: string;
    item: {
      title: string;
      itemType: TripItemTypeDto;
      sequence: number;
      startTime?: string | null;
      endTime?: string | null;
      durationMinutes?: number | null;
      inboxItemId?: string | null;
    };
  })
  | (ProposalOperationBaseDto & {
    type: 'MOVE_ITEM';
    itemId: string;
    toDayId: string;
    sequence: number;
  })
  | (ProposalOperationBaseDto & {
    type: 'UPDATE_TIME';
    itemId: string;
    startTime: string | null;
    endTime: string | null;
  })
  | (ProposalOperationBaseDto & {
    type: 'CHANGE_DURATION';
    itemId: string;
    durationMinutes: number;
  })
  | (ProposalOperationBaseDto & {
    type: 'REMOVE_ITEM';
    itemId: string;
  });

export type TripProposalDto = {
  id: string;
  tripId: string;
  createdById: string | null;
  actorType: 'AI_PROVIDER' | 'DETERMINISTIC_OPTIMIZER' | 'USER';
  baseRevision: number;
  operations: TripProposalOperationDto[];
  rationale: string;
  status: 'APPLIED' | 'PARTIALLY_APPLIED' | 'PENDING' | 'REJECTED' | 'STALE';
  providerName: string | null;
  modelName: string | null;
  appliedOperationIndexes: number[] | null;
  createdAt: string;
  updatedAt: string;
};

export type TripVoteDto = {
  id: string;
  tripId: string;
  targetType: 'INBOX_ITEM' | 'ITEM' | 'PROPOSAL';
  targetId: string;
  userId: string;
  user?: UserSummaryDto;
  value: -1 | 1;
  createdAt: string;
  updatedAt: string;
};

export type TripCommentDto = {
  id: string;
  tripId: string;
  targetType: 'INBOX_ITEM' | 'ITEM' | 'PROPOSAL' | 'TRIP';
  targetId: string | null;
  userId: string;
  user?: UserSummaryDto;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type TripActivityDto = {
  id: string;
  tripId: string;
  actorId: string;
  actor?: UserSummaryDto;
  action: string;
  metadata: Record<string, unknown>;
  tripRevision: number;
  createdAt: string;
};

export type ActivityResultDto = {
  data: TripActivityDto[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
  };
};

export type TripInvitationResultDto = {
  invitation: {
    id: string;
    tripId: string;
    email: string;
    role: TripRoleDto;
    status: 'ACCEPTED' | 'EXPIRED' | 'PENDING' | 'REVOKED';
    expiresAt: string;
  };
  token: string;
  tripRevision: number;
};

export type TripItemActualDto = {
  id: string;
  tripId: string;
  itemId: string;
  recordedById: string;
  status: TripActualStatusDto;
  actualStartAt: string | null;
  actualEndAt: string | null;
  notes: string | null;
  mediaRefs: string[];
  createdAt: string;
  updatedAt: string;
};

export type RecordActualResultDto = {
  actual: TripItemActualDto;
  tripRevision: number;
  replanProposal: TripProposalDto | null;
};

export type TripOfflineSnapshotDto = {
  trip: TripDto;
  days: TripDayDto[];
  actuals: TripItemActualDto[];
  routeLegs: TripRouteLegDto[];
  findings: TripFindingDto[];
  generatedAt: string;
  tripRevision: number;
  offlineWritePolicy: Array<'ACTUAL_NOTES' | 'ACTUAL_STATUS'>;
  routeDisclaimer: string;
};

export type TripPublishDraftDto = {
  draft: {
    title: string;
    description?: string;
    days: Array<{
      dayNumber: number;
      date: string;
      places: Array<{
        type: TripItemTypeDto;
        name: string;
        description?: string;
        startTime?: string;
        endTime?: string;
        order: number;
      }>;
    }>;
  };
  privacy: {
    denyByDefault: true;
    excludedFields: string[];
    preciseLocationsRemoved: number;
    collaboratorCommentsRemoved: boolean;
  };
  sourceTripId: string;
  sourceTripRevision: number;
  nextStep: string;
};
