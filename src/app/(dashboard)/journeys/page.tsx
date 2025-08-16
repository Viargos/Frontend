"use client";

import { useEffect } from 'react';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useJourneyStore } from '@/store/journey.store';
import { useAuthStore } from '@/store/auth.store';
import JourneysHeader from '@/components/journeys/JourneysHeader';
import JourneysGrid from '@/components/journeys/JourneysGrid';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function JourneysPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { 
    journeys, 
    isLoading, 
    error, 
    loadMyJourneys, 
    clearError,
    deleteJourney,
    duplicateJourney
  } = useJourneyStore();

  // Load journeys when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadMyJourneys();
    }
  }, [isAuthenticated, authLoading, loadMyJourneys]);

  const handleCreateJourney = () => {
    // This will be handled by the JourneysHeader component
    // which will show the NewJourneyModal
  };

  const handleEditJourney = async (journey: any) => {
    // For now, we'll just show an alert
    // In the future, this could open an edit modal
    alert(`Edit journey: ${journey.title}`);
  };

  const handleDeleteJourney = async (journeyId: string) => {
    if (window.confirm('Are you sure you want to delete this journey?')) {
      await deleteJourney(journeyId);
    }
  };

  const handleDuplicateJourney = async (journeyId: string) => {
    await duplicateJourney(journeyId);
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={clearError}
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
