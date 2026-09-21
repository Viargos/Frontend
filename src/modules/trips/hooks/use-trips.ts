'use client';

import type {
  CreateTripInput,
  InboxFilters,
  RecordActualInput,
  TripWorkspaceTab,
} from '@/modules/trips/types/trip.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appConfig } from '@/lib/app-config';
import { useAuthSession } from '@/modules/auth/hooks/use-auth-session';
import { tripQueryKeys } from '@/modules/trips/query-keys';
import { tripService } from '@/modules/trips/services/trip.service';

type TripApiError = Error & {
  code?: string;
  statusCode?: number;
};

export function useTripList() {
  const queryClient = useQueryClient();
  const { session } = useAuthSession();
  const actorId = session.user?.id;
  const listQuery = useQuery({
    queryFn: () => tripService.list(actorId),
    queryKey: tripQueryKeys.list(),
    staleTime: appConfig.reactQuery.staleTimeMs,
  });
  const createMutation = useMutation({
    mutationFn: (input: CreateTripInput) => tripService.create(input, actorId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tripQueryKeys.list() });
    },
  });

  return {
    createTrip: createMutation.mutateAsync,
    error: (listQuery.error ?? createMutation.error) as TripApiError | null,
    isCreating: createMutation.isPending,
    isLoading: listQuery.isLoading,
    refetch: listQuery.refetch,
    trips: listQuery.data?.items ?? [],
  };
}

export function useTripDetail(tripId: string) {
  const { session } = useAuthSession();
  const actorId = session.user?.id;

  return useQuery({
    queryFn: () => tripService.get(tripId, actorId),
    queryKey: tripQueryKeys.detail(tripId),
    staleTime: appConfig.reactQuery.staleTimeMs,
  });
}

export function useTripWorkspaceSection(
  tripId: string,
  tab: TripWorkspaceTab,
  inboxFilters?: InboxFilters,
) {
  const inbox = useQuery({
    enabled: tab === 'inbox',
    queryFn: () => tripService.inbox(tripId, inboxFilters),
    queryKey: tripQueryKeys.inbox(tripId, inboxFilters),
  });
  const days = useQuery({
    enabled: tab === 'inbox' || tab === 'plan' || tab === 'live',
    queryFn: () => tripService.days(tripId),
    queryKey: tripQueryKeys.days(tripId),
  });
  const items = useQuery({
    enabled: tab === 'plan' || tab === 'live',
    queryFn: () => tripService.items(tripId),
    queryKey: tripQueryKeys.items(tripId),
  });
  const findings = useQuery({
    enabled: tab === 'readiness',
    queryFn: () => tripService.findings(tripId),
    queryKey: tripQueryKeys.findings(tripId),
  });
  const readiness = useQuery({
    enabled: tab === 'readiness',
    queryFn: () => tripService.readiness(tripId),
    queryKey: tripQueryKeys.readiness(tripId),
  });
  const members = useQuery({
    enabled: tab === 'collaboration',
    queryFn: () => tripService.members(tripId),
    queryKey: tripQueryKeys.members(tripId),
  });
  const comments = useQuery({
    enabled: tab === 'collaboration',
    queryFn: () => tripService.comments(tripId),
    queryKey: tripQueryKeys.comments(tripId),
  });
  const votes = useQuery({
    enabled: tab === 'collaboration',
    queryFn: () => tripService.votes(tripId),
    queryKey: tripQueryKeys.votes(tripId),
  });
  const activity = useQuery({
    enabled: tab === 'collaboration',
    queryFn: () => tripService.activity(tripId),
    queryKey: tripQueryKeys.activity(tripId),
  });
  const proposals = useQuery({
    enabled: tab === 'readiness',
    queryFn: () => tripService.proposals(tripId),
    queryKey: tripQueryKeys.proposals(tripId),
  });
  const offline = useQuery({
    enabled: tab === 'live',
    queryFn: () => tripService.offlineSnapshot(tripId),
    queryKey: tripQueryKeys.offline(tripId),
  });

  const queries = [inbox, days, items, findings, readiness, members, comments, votes, activity, proposals, offline];
  return {
    activity: activity.data ?? { data: [], pagination: { hasMore: false, nextCursor: null } },
    comments: comments.data ?? [],
    days: days.data ?? [],
    error: queries.find(query => query.error)?.error as TripApiError | undefined,
    findings: findings.data ?? [],
    inbox: inbox.data ?? [],
    isLoading: queries.some(query => query.isLoading),
    items: items.data ?? [],
    members: members.data ?? [],
    offlineSnapshot: offline.data,
    proposals: proposals.data ?? [],
    readiness: readiness.data,
    votes: votes.data ?? [],
  };
}

export function useTripActions(tripId: string, revision: number) {
  const queryClient = useQueryClient();
  const { session } = useAuthSession();
  const actorId = session.user?.id;
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.detail(tripId) }),
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.inbox(tripId) }),
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.days(tripId) }),
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.items(tripId) }),
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.findings(tripId) }),
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.readiness(tripId) }),
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.proposals(tripId) }),
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.members(tripId) }),
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.comments(tripId) }),
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.votes(tripId) }),
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.activity(tripId) }),
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.offline(tripId) }),
    ]);
  };
  const mutationOptions = { onSuccess: refresh };

  const recalculate = useMutation({
    mutationFn: () => tripService.recalculate(tripId, revision),
    ...mutationOptions,
  });
  const startLive = useMutation({
    mutationFn: () => tripService.startLive(tripId, revision, actorId),
    ...mutationOptions,
  });
  const publishDraft = useMutation({
    mutationFn: (title?: string) => tripService.publishDraft(tripId, revision, title),
  });
  const applyProposal = useMutation({
    mutationFn: (input: { proposalId: string; selectedOperationIndexes?: number[] }) =>
      tripService.applyProposal({ ...input, revision, tripId }),
    ...mutationOptions,
  });
  const recordActual = useMutation({
    mutationFn: (input: RecordActualInput) => tripService.recordActual({ ...input, revision, tripId }),
    ...mutationOptions,
  });
  const importJourney = useMutation({
    mutationFn: (input: { selectedDayIds?: string[]; selectedItemIds?: string[]; sourceJourneyId: string }) =>
      tripService.importJourney({ ...input, revision, tripId }),
    ...mutationOptions,
  });
  const updateInbox = useMutation({
    mutationFn: (input: { itemId: string; notes?: string; priority?: number; tags?: string[] }) =>
      tripService.updateInbox({ ...input, revision, tripId }),
    ...mutationOptions,
  });
  const bulkInbox = useMutation({
    mutationFn: (input: {
      itemIds: string[];
      operation: 'ADD_TAG' | 'REMOVE' | 'SET_PRIORITY';
      priority?: number;
      tag?: string;
    }) => tripService.bulkInbox({ ...input, revision, tripId }),
    ...mutationOptions,
  });
  const mergeInbox = useMutation({
    mutationFn: (input: { duplicateItemIds: string[]; primaryItemId: string }) =>
      tripService.mergeInbox({ ...input, revision, tripId }),
    ...mutationOptions,
  });
  const createDay = useMutation({
    mutationFn: (input: { localDate?: string; title?: string }) =>
      tripService.createDay({ ...input, revision, tripId }),
    ...mutationOptions,
  });
  const createItem = useMutation({
    mutationFn: (input: {
      dayId: string;
      durationMinutes?: number;
      inboxItemId?: string;
      startTime?: string;
      title: string;
      type: 'ACTIVITY' | 'FOOD' | 'NOTE' | 'STAY' | 'TRANSPORT';
    }) => tripService.createItem({ ...input, revision, tripId }),
    ...mutationOptions,
  });
  const reorderItems = useMutation({
    mutationFn: (items: Array<{ dayId: string; itemId: string; sequence: number }>) =>
      tripService.reorderItems({ items, revision, tripId }),
    ...mutationOptions,
  });
  const resolveFinding = useMutation({
    mutationFn: (input: { action: 'OVERRIDE' | 'RESOLVE'; findingId: string; reason: string }) =>
      tripService.resolveFinding({ ...input, revision, tripId }),
    ...mutationOptions,
  });
  const inviteMember = useMutation({
    mutationFn: (input: { email: string; role: 'EDITOR' | 'VIEWER' }) =>
      tripService.inviteMember({ ...input, revision, tripId }),
    ...mutationOptions,
  });
  const createVote = useMutation({
    mutationFn: (input: {
      targetId: string;
      targetType: 'INBOX_ITEM' | 'ITEM' | 'PROPOSAL';
      value: -1 | 1;
    }) => tripService.createVote({ ...input, revision, tripId }),
    ...mutationOptions,
  });
  const createComment = useMutation({
    mutationFn: (input: {
      body: string;
      targetId?: string;
      targetType: 'INBOX_ITEM' | 'ITEM' | 'PROPOSAL' | 'TRIP';
    }) => tripService.createComment({ ...input, revision, tripId }),
    ...mutationOptions,
  });
  const mutations = [
    recalculate,
    startLive,
    publishDraft,
    applyProposal,
    recordActual,
    importJourney,
    updateInbox,
    bulkInbox,
    mergeInbox,
    createDay,
    createItem,
    reorderItems,
    resolveFinding,
    inviteMember,
    createVote,
    createComment,
  ];

  return {
    applyProposal: applyProposal.mutateAsync,
    bulkInbox: bulkInbox.mutateAsync,
    createComment: createComment.mutateAsync,
    createDay: createDay.mutateAsync,
    createItem: createItem.mutateAsync,
    createVote: createVote.mutateAsync,
    error: mutations.find(mutation => mutation.error)?.error as TripApiError | null,
    importJourney: importJourney.mutateAsync,
    importResult: importJourney.data,
    invitationResult: inviteMember.data,
    inviteMember: inviteMember.mutateAsync,
    isPending: mutations.some(mutation => mutation.isPending),
    mergeInbox: mergeInbox.mutateAsync,
    publishDraft: publishDraft.mutateAsync,
    publishPreview: publishDraft.data,
    recalculate: recalculate.mutateAsync,
    recalculation: recalculate.data,
    recordActual: recordActual.mutateAsync,
    recordActualResult: recordActual.data,
    reorderItems: reorderItems.mutateAsync,
    resolveFinding: resolveFinding.mutateAsync,
    startLive: startLive.mutateAsync,
    updateInbox: updateInbox.mutateAsync,
  };
}
