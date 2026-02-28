'use client';

import type { JourneyListItem } from '@/modules/journey/types/journey.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appConfig } from '@/lib/app-config';
import { journeyQueryKeys } from '@/modules/journey/query-keys';
import { journeyService } from '@/modules/journey/services/journey.service';

type DeleteContext = {
  previousJourneys: JourneyListItem[];
};

export function useJourneyList(initialJourneys: JourneyListItem[]) {
  const queryClient = useQueryClient();

  const listQuery = useQuery<JourneyListItem[]>({
    initialData: initialJourneys,
    queryFn: journeyService.list,
    queryKey: journeyQueryKeys.list(),
    staleTime: appConfig.reactQuery.staleTimeMs,
  });

  const deleteMutation = useMutation<void, Error, string, DeleteContext>({
    mutationFn: journeyService.delete,
    onMutate: async (journeyId) => {
      await queryClient.cancelQueries({ queryKey: journeyQueryKeys.list() });
      const previousJourneys = queryClient.getQueryData<JourneyListItem[]>(journeyQueryKeys.list()) ?? [];

      queryClient.setQueryData<JourneyListItem[]>(
        journeyQueryKeys.list(),
        previousJourneys.filter(journey => journey.id !== journeyId),
      );

      return { previousJourneys };
    },
    onError: (_error, _journeyId, context) => {
      if (!context) {
        return;
      }
      queryClient.setQueryData(journeyQueryKeys.list(), context.previousJourneys);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: journeyQueryKeys.list() });
    },
  });

  return {
    deleteJourney: deleteMutation.mutateAsync,
    error: listQuery.error instanceof Error ? listQuery.error.message : null,
    isDeleting: deleteMutation.isPending,
    isLoading: listQuery.isLoading,
    journeys: listQuery.data ?? [],
  };
}
