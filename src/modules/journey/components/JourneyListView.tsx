'use client';

import type { JourneyListItem } from '@/modules/journey/types/journey.types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { JourneyList } from '@/modules/journey/components/JourneyList';
import { JourneyListHeader } from '@/modules/journey/components/JourneyListHeader';
import { useJourneyList } from '@/modules/journey/hooks';

type JourneyListViewProps = {
  initialJourneys: JourneyListItem[];
};

export const JourneyListView = (props: JourneyListViewProps) => {
  const { initialJourneys } = props;
  const { deleteJourney, error: queryError, isLoading, journeys } = useJourneyList(initialJourneys);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateJourney = () => {
    router.push('/create-journey');
  };

  const handleEditJourney = (journey: JourneyListItem) => {
    router.push(`/edit-journey/${journey.id}`);
  };

  const handleDeleteJourney = async (journeyId: string) => {
    try {
      await deleteJourney(journeyId);
      setMutationError(null);
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Failed to delete journey');
    }
  };

  const handleDuplicateJourney = async (_journeyId: string) => {
    setMutationError('Duplicate journey is not available yet.');
  };

  const displayError = mutationError ?? queryError;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {displayError
        ? (
            <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <span>{displayError}</span>
              <button
                onClick={() => setMutationError(null)}
                className="text-red-600 transition-colors hover:text-red-800"
                type="button"
              >
                ×
              </button>
            </div>
          )
        : null}

      <JourneyListHeader onCreateJourney={handleCreateJourney} />

      <JourneyList
        journeys={journeys}
        isLoading={isLoading}
        onCreateJourney={handleCreateJourney}
        onDeleteJourney={handleDeleteJourney}
        onDuplicateJourney={handleDuplicateJourney}
        onEditJourney={handleEditJourney}
      />
    </div>
  );
};
