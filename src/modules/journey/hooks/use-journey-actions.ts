'use client';

import type { JourneyDetail } from '@/modules/journey/types/journey-detail.types';
import type { JourneyCreateInput, JourneyListItem } from '@/modules/journey/types/journey.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { journeyQueryKeys } from '@/modules/journey/query-keys';
import { journeyService } from '@/modules/journey/services/journey.service';

export function useJourneyActions() {
  const queryClient = useQueryClient();

  const createJourneyMutation = useMutation({
    mutationFn: (input: JourneyCreateInput) => journeyService.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: journeyQueryKeys.list() });
    },
  });

  const updateJourneyMutation = useMutation({
    mutationFn: ({ journeyId, payload }: { journeyId: string; payload: { description?: string; title?: string } }) =>
      journeyService.update(journeyId, payload),
    onSuccess: async (updatedJourney) => {
      queryClient.setQueryData<JourneyDetail>(
        journeyQueryKeys.detail(updatedJourney.id),
        updatedJourney,
      );
      await queryClient.invalidateQueries({ queryKey: journeyQueryKeys.list() });
    },
  });

  const deleteJourneyMutation = useMutation({
    mutationFn: (journeyId: string) => journeyService.delete(journeyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: journeyQueryKeys.list() });
    },
  });

  const createJourney = (input: JourneyCreateInput): Promise<JourneyListItem> => {
    return createJourneyMutation.mutateAsync(input);
  };

  const updateJourney = (journeyId: string, payload: { description?: string; title?: string }): Promise<JourneyDetail> => {
    return updateJourneyMutation.mutateAsync({ journeyId, payload });
  };

  const deleteJourney = (journeyId: string): Promise<void> => {
    return deleteJourneyMutation.mutateAsync(journeyId);
  };

  return {
    createJourney,
    deleteJourney,
    isCreatingJourney: createJourneyMutation.isPending,
    updateJourney,
  };
}
