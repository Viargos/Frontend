"use client";

import { useState } from 'react';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useJourneyStore } from '@/store/journey.store';
import { useAuthStore } from '@/store/auth.store';
import { useMyJourneys, useDeleteJourney, useDuplicateJourney } from '@/hooks/journey/useJourneyQueries';
import { JourneysHeader, JourneysGrid } from '@/components/journeys';
import { LoadingSpinner } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function JourneysPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAuthenticated = user !== null;
  const authLoading = false; // No loading state needed - middleware handles auth

  // UI state (filters) from simplified store
  const { filters } = useJourneyStore();

  // Data fetching with React Query
  const { data: journeys = [], isLoading, error } = useMyJourneys(filters);
  const deleteMutation = useDeleteJourney();
  const duplicateMutation = useDuplicateJourney();

  // Local error state for mutations
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleCreateJourney = () => {
    // This will be handled by the JourneysHeader component
    // which will show the NewJourneyModal
  };

  const handleEditJourney = async (journey: any) => {
    router.push(`/edit-journey/${journey.id}`);
  };

  const handleDeleteJourney = async (journeyId: string) => {
    if (window.confirm('Are you sure you want to delete this journey?')) {
      try {
        await deleteMutation.mutateAsync(journeyId);
        setMutationError(null);
      } catch (err) {
        setMutationError(err instanceof Error ? err.message : 'Failed to delete journey');
      }
    }
  };

  const handleDuplicateJourney = async (journeyId: string) => {
    try {
      await duplicateMutation.mutateAsync({ id: journeyId });
      setMutationError(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Failed to duplicate journey');
    }
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Combine query error and mutation error
  const displayError = error?.message || mutationError;

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Error Message */}
          {displayError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
              <span>{displayError}</span>
              <button
                onClick={() => setMutationError(null)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                ×
              </button>
            </div>
          )}

          {/* Page Header with Search and Create */}
          <JourneysHeader
            onCreateJourney={handleCreateJourney}
          />

          {/* Main Content */}
          <JourneysGrid
            journeys={journeys}
            isLoading={isLoading}
            onCreateJourney={handleCreateJourney}
            onEditJourney={handleEditJourney}
            onDeleteJourney={handleDeleteJourney}
            onDuplicateJourney={handleDuplicateJourney}
          />
      </div>
    </ProtectedRoute>
  );
}
