/**
 * React Query hooks for Journey operations
 * Replaces most of journey.store.ts with better caching and simpler code
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JourneyApi } from '@/lib/api';
import {
  Journey,
  CreateJourneyDto,
  UpdateJourneyDto,
  JourneyFilters,
  JourneyStats,
  DetailedJourney,
  DetailedJourneyDay,
  JourneyBanner,
  AddActivityData,
  UpdateActivityData,
  JourneyLocation,
  CreateComprehensiveJourneyDto,
} from '@/types/journey.types';

// ============================================================================
// Query Keys
// ============================================================================

export const journeyKeys = {
  all: ['journeys'] as const,
  lists: () => [...journeyKeys.all, 'list'] as const,
  list: (filters?: JourneyFilters) => [...journeyKeys.lists(), filters] as const,
  myJourneys: (filters?: JourneyFilters) => [...journeyKeys.all, 'my', filters] as const,
  details: () => [...journeyKeys.all, 'detail'] as const,
  detail: (id: string) => [...journeyKeys.details(), id] as const,
  stats: (userId?: string) => [...journeyKeys.all, 'stats', userId] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch user's own journeys
 */
export function useMyJourneys(filters?: JourneyFilters) {
  return useQuery({
    queryKey: journeyKeys.myJourneys(filters),
    queryFn: () => JourneyApi.getMyJourneys(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch all journeys (explore page)
 */
export function useAllJourneys(filters?: JourneyFilters) {
  return useQuery({
    queryKey: journeyKeys.list(filters),
    queryFn: () => JourneyApi.getAllJourneys(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch single journey by ID
 */
export function useJourney(id: string | null) {
  return useQuery({
    queryKey: journeyKeys.detail(id!),
    queryFn: () => JourneyApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch journey statistics
 */
export function useJourneyStats(userId?: string) {
  return useQuery({
    queryKey: journeyKeys.stats(userId),
    queryFn: async () => {
      // Compute stats from journeys list
      const journeys = userId
        ? await JourneyApi.getAllJourneys()
        : await JourneyApi.getMyJourneys();

      const stats: JourneyStats = {
        totalJourneys: journeys.length,
        publishedJourneys: journeys.length,
        totalPlaces: journeys.reduce(
          (sum, j) =>
            sum + (j.days?.reduce((ds, d) => ds + (d.places?.length || 0), 0) || 0),
          0
        ),
        totalDays: journeys.reduce((sum, j) => sum + (j.days?.length || 0), 0),
      };

      return stats;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create journey mutation
 */
export function useCreateJourney() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJourneyDto) => JourneyApi.createJourney(data),
    onSuccess: (newJourney) => {
      // Invalidate and refetch journey lists
      queryClient.invalidateQueries({ queryKey: journeyKeys.myJourneys() });
      queryClient.invalidateQueries({ queryKey: journeyKeys.stats() });
    },
  });
}

/**
 * Create comprehensive journey (with days/activities)
 */
export function useCreateComprehensiveJourney() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateComprehensiveJourneyDto) =>
      JourneyApi.createComprehensiveJourney(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journeyKeys.myJourneys() });
      queryClient.invalidateQueries({ queryKey: journeyKeys.stats() });
    },
  });
}

/**
 * Update journey mutation
 */
export function useUpdateJourney() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJourneyDto }) =>
      JourneyApi.updateJourney(id, data),
    onSuccess: (updatedJourney) => {
      // Update specific journey in cache
      queryClient.setQueryData(
        journeyKeys.detail(updatedJourney.id),
        updatedJourney
      );
      // Invalidate lists to show updated data
      queryClient.invalidateQueries({ queryKey: journeyKeys.myJourneys() });
      queryClient.invalidateQueries({ queryKey: journeyKeys.lists() });
    },
  });
}

/**
 * Delete journey mutation
 */
export function useDeleteJourney() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => JourneyApi.deleteJourney(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: journeyKeys.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: journeyKeys.myJourneys() });
      queryClient.invalidateQueries({ queryKey: journeyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: journeyKeys.stats() });
    },
  });
}

/**
 * Duplicate journey mutation
 * Complex operation: fetch source → transform → create new
 */
export function useDuplicateJourney() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newTitle }: { id: string; newTitle?: string }) => {
      // Fetch source journey
      const source = await JourneyApi.getById(id);

      // Transform JourneyDay[] to CreateJourneyDay[] (remove id and journey/day fields)
      const days = source.days.map((day) => ({
        dayNumber: day.dayNumber,
        date: day.date,
        notes: day.notes,
        places: day.places.map((place) => ({
          type: place.type,
          name: place.name,
          description: place.description,
          startTime: place.startTime,
          endTime: place.endTime,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          media: place.media,
        })),
      }));

      // Create comprehensive journey with transformed data
      return JourneyApi.createComprehensiveJourney({
        title: newTitle || `${source.title} (Copy)`,
        description: source.description,
        days,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journeyKeys.myJourneys() });
      queryClient.invalidateQueries({ queryKey: journeyKeys.stats() });
    },
  });
}

/**
 * Update journey banner mutation
 */
export function useUpdateJourneyBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, banner }: { id: string; banner: JourneyBanner }) =>
      JourneyApi.updateJourneyBanner(id, banner),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: journeyKeys.detail(id) });
    },
  });
}

/**
 * Add day to journey mutation
 */
export function useAddDayToJourney() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, day }: { id: string; day: { date: string } }) =>
      JourneyApi.addDayToJourney(id, day),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: journeyKeys.detail(id) });
    },
  });
}

/**
 * Remove day from journey mutation
 */
export function useRemoveDayFromJourney() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dayId }: { id: string; dayId: string }) =>
      JourneyApi.removeDayFromJourney(id, dayId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: journeyKeys.detail(id) });
    },
  });
}

/**
 * Add activity to day mutation
 */
export function useAddActivityToDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ journeyId, data }: { journeyId: string; data: AddActivityData }) =>
      JourneyApi.addActivityToDay(journeyId, data),
    onSuccess: (_, { journeyId }) => {
      queryClient.invalidateQueries({ queryKey: journeyKeys.detail(journeyId) });
    },
  });
}

/**
 * Update activity mutation
 */
export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ journeyId, data }: { journeyId: string; data: UpdateActivityData }) =>
      JourneyApi.updateActivity(journeyId, data),
    onSuccess: (_, { journeyId }) => {
      queryClient.invalidateQueries({ queryKey: journeyKeys.detail(journeyId) });
    },
  });
}

/**
 * Remove activity mutation
 */
export function useRemoveActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ journeyId, locationId }: { journeyId: string; locationId: string }) =>
      JourneyApi.removeActivity(journeyId, locationId),
    onSuccess: (_, { journeyId }) => {
      queryClient.invalidateQueries({ queryKey: journeyKeys.detail(journeyId) });
    },
  });
}

/**
 * Reorder activities mutation
 */
export function useReorderActivities() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      journeyId,
      dayId,
      locationIds,
    }: {
      journeyId: string;
      dayId: string;
      locationIds: string[];
    }) => JourneyApi.reorderActivities(journeyId, dayId, locationIds),
    onSuccess: (_, { journeyId }) => {
      queryClient.invalidateQueries({ queryKey: journeyKeys.detail(journeyId) });
    },
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Transform basic journey to DetailedJourney format
 * Used for edit pages that need activities grouped by type
 */
export function useDetailedJourney(id: string | null) {
  return useQuery({
    queryKey: [...journeyKeys.detail(id!), 'detailed'],
    queryFn: async () => {
      if (!id) return null;

      const journey = await JourneyApi.getById(id);

      // Transform basic journey to DetailedJourney format with activities grouped by type
      const detailedDays: DetailedJourneyDay[] = journey.days.map((day) => ({
        id: day.id,
        dayNumber: day.dayNumber,
        date: day.date,
        activities: {
          placeToStay: day.places.filter((p) => p.type === 'STAY'),
          placesToGo: day.places.filter((p) => p.type === 'ACTIVITY'),
          food: day.places.filter((p) => p.type === 'FOOD'),
          transport: day.places.filter((p) => p.type === 'TRANSPORT'),
          notes: day.places.filter((p) => p.type === 'NOTE'),
        },
        notes: day.notes,
      }));

      const detailedJourney: DetailedJourney = {
        ...journey,
        days: detailedDays,
        banner: {
          title: journey.title,
          subtitle: `${detailedDays.length} ${detailedDays.length === 1 ? 'day' : 'days'}`,
          description: journey.description,
          imageUrl: journey.coverImage,
          gradientColors: {
            from: '#4F46E5',
            via: '#7C3AED',
            to: '#DB2777',
          },
        },
      };

      return detailedJourney;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
