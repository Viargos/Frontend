/**
 * Simplified Journey Store (React Query Migration)
 *
 * BEFORE: 690 lines - handled ALL journey data fetching + state
 * AFTER: ~80 lines - ONLY handles filters + search (persistent UI state)
 *
 * Data fetching moved to: /src/hooks/journey/useJourneyQueries.ts (React Query)
 *
 * Why this is better:
 * - Less code (690 → 80 lines, 88% reduction)
 * - Better caching (React Query handles it automatically)
 * - Automatic refetching (React Query manages stale data)
 * - Simpler to maintain (single responsibility: UI state persistence)
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { JourneyFilters } from "@/types/journey.types";

// ============================================================================
// Store Interface
// ============================================================================

interface JourneyStore {
  // Persistent UI state (saved to localStorage)
  filters: JourneyFilters;
  searchQuery: string;

  // Actions - Filter Management
  setFilters: (filters: Partial<JourneyFilters>) => void;
  resetFilters: () => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialFilters: JourneyFilters = {
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  limit: 20,
  offset: 0,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useJourneyStore = create<JourneyStore>()(
  persist(
    (set, get) => ({
      // Initial state
      filters: initialFilters,
      searchQuery: '',

      // Filter Management Actions
      setFilters: (newFilters: Partial<JourneyFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      resetFilters: () => {
        set({ filters: initialFilters });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      reset: () => {
        set({
          filters: initialFilters,
          searchQuery: '',
        });
      },
    }),
    {
      name: 'journey-store',
      // Persist filters and search query to localStorage
      partialize: (state) => ({
        filters: state.filters,
        searchQuery: state.searchQuery,
      }),
    }
  )
);

// ============================================================================
// Migration Notes
// ============================================================================

/**
 * OLD USAGE (journey.store.ts):
 * ```typescript
 * const { journeys, isLoading, loadMyJourneys, deleteJourney } = useJourneyStore();
 *
 * useEffect(() => {
 *   loadMyJourneys();
 * }, []);
 * ```
 *
 * NEW USAGE (React Query):
 * ```typescript
 * import { useMyJourneys, useDeleteJourney } from '@/hooks/journey/useJourneyQueries';
 * import { useJourneyStore } from '@/store/journey.store';
 *
 * const { filters } = useJourneyStore();
 * const { data: journeys, isLoading } = useMyJourneys(filters);
 * const deleteMutation = useDeleteJourney();
 *
 * const handleDelete = (id: string) => {
 *   deleteMutation.mutate(id);
 * };
 * ```
 *
 * BENEFITS:
 * - Automatic caching (no manual loading/refetching logic)
 * - Automatic refetching (stale data managed by React Query)
 * - Better error handling (React Query built-in)
 * - Less boilerplate (no manual set({ isLoading: true }))
 * - Smaller store (only UI state, not data)
 */
