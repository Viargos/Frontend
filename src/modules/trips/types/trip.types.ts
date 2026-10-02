import type {
  ActivityResultDto,
  TripActualStatusDto,
  TripCommentDto,
  TripDayDto,
  TripFindingDto,
  TripInboxItemDto,
  TripItemDto,
  TripMemberDto,
  TripOfflineSnapshotDto,
  TripPaceDto,
  TripProposalDto,
  TripPublishDraftDto,
  TripReadinessDto,
  TripRoleDto,
  TripRouteLegDto,
  TripStateDto,
  TripTransportModeDto,
  TripVoteDto,
} from '@/modules/trips/dto/trip.dto';

export type TripState = TripStateDto;
export type TripRole = TripRoleDto;

export type Trip = {
  archivedAt?: string;
  createdAt: string;
  currency: string;
  description?: string;
  destinations: Array<{
    id: string;
    name: string;
    order: number;
  }>;
  endDate?: string;
  id: string;
  lightweightMode: boolean;
  members: TripMemberDto[];
  pace: TripPaceDto;
  preferences: Record<string, boolean | number | string>;
  revision: number;
  role: TripRole;
  startDate?: string;
  state: TripState;
  timezone: string;
  title: string;
  transportMode: TripTransportModeDto;
  travellerCount: number;
  updatedAt: string;
  viewerCanComment: boolean;
  viewerCanVote: boolean;
  visibility: 'PRIVATE' | 'SHARED';
};

export type TripList = {
  hasMore: boolean;
  items: Trip[];
  nextCursor?: string;
};

export type CreateTripInput = {
  currency: string;
  description?: string;
  endDate?: string;
  flexibleDates: boolean;
  pace: TripPaceDto;
  startDate?: string;
  timezone: string;
  title: string;
  transportMode: TripTransportModeDto;
  travellerCount: number;
};

export type InboxFilters = {
  search?: string;
  status?: 'INBOX' | 'MERGED' | 'REMOVED' | 'SCHEDULED';
  tag?: string;
};

export type TripWorkspaceData = {
  activity: ActivityResultDto;
  comments: TripCommentDto[];
  days: TripDayDto[];
  findings: TripFindingDto[];
  inbox: TripInboxItemDto[];
  items: TripItemDto[];
  members: TripMemberDto[];
  offlineSnapshot?: TripOfflineSnapshotDto;
  proposals: TripProposalDto[];
  publishDraft?: TripPublishDraftDto;
  readiness?: TripReadinessDto;
  routeLegs: TripRouteLegDto[];
  votes: TripVoteDto[];
};

export type TripWorkspaceTab = 'collaboration' | 'inbox' | 'live' | 'overview' | 'plan' | 'post-trip' | 'readiness';

export type RecordActualInput = {
  itemId: string;
  status: TripActualStatusDto;
  notes?: string;
  actualStartAt?: string;
  actualEndAt?: string;
};
