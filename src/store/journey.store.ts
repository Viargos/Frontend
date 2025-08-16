import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Journey,
  CreateJourneyDto,
  UpdateJourneyDto,
  JourneyStats,
  JourneyFilters,
  DetailedJourney,
  JourneyBanner,
  AddActivityData,
  UpdateActivityData,
  JourneyLocation,
} from "@/types/journey.types";
import { journeyService } from "@/lib/services/service-factory";

interface JourneyStore {
  // State
  journeys: Journey[];
  currentJourney: Journey | null;
  detailedJourney: DetailedJourney | null;
  stats: JourneyStats | null;
  filters: JourneyFilters;
  searchQuery: string;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isLoadingStats: boolean;
  isLoadingDetailed: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions - Journey Management
  loadMyJourneys: (filters?: JourneyFilters) => Promise<void>;
  loadAllJourneys: (filters?: JourneyFilters) => Promise<void>;
  loadJourney: (id: string) => Promise<void>;
  createJourney: (data: CreateJourneyDto) => Promise<Journey | null>;
  updateJourney: (id: string, data: UpdateJourneyDto) => Promise<Journey | null>;
  deleteJourney: (id: string) => Promise<boolean>;
  duplicateJourney: (id: string, newTitle?: string) => Promise<Journey | null>;
  
  // Actions - Detailed Journey Management
  loadDetailedJourney: (id: string) => Promise<void>;
  updateJourneyBanner: (id: string, banner: JourneyBanner) => Promise<void>;
  addDayToJourney: (id: string, day: { date: string }) => Promise<void>;
  removeDayFromJourney: (id: string, dayId: string) => Promise<void>;
  addActivityToDay: (journeyId: string, data: AddActivityData) => Promise<JourneyLocation | null>;
  updateActivity: (journeyId: string, data: UpdateActivityData) => Promise<JourneyLocation | null>;
  removeActivity: (journeyId: string, locationId: string) => Promise<void>;
  reorderActivities: (journeyId: string, dayId: string, locationIds: string[]) => Promise<void>;
  searchLocations: (query: string, center?: { lat: number; lng: number }) => Promise<JourneyLocation[]>;
  
  // Actions - Statistics
  loadStats: (userId?: string) => Promise<void>;
  
  // Actions - Search and Filtering
  searchJourneys: (query: string) => Promise<void>;
  setFilters: (filters: Partial<JourneyFilters>) => void;
  resetFilters: () => void;
  setSearchQuery: (query: string) => void;
  
  // Actions - UI State
  clearError: () => void;
  setCurrentJourney: (journey: Journey | null) => void;
  setDetailedJourney: (journey: DetailedJourney | null) => void;
  reset: () => void;
}

const initialFilters: JourneyFilters = {
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  limit: 20,
  offset: 0,
};

export const useJourneyStore = create<JourneyStore>()(
  persist(
    (set, get) => ({
      // Initial state
      journeys: [],
      currentJourney: null,
      detailedJourney: null,
      stats: null,
      filters: initialFilters,
      searchQuery: '',
      
      // Loading states
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isLoadingStats: false,
      isLoadingDetailed: false,
      
      // Error state
      error: null,

      // Journey Management Actions
      loadMyJourneys: async (filters?: JourneyFilters) => {
        try {
          set({ isLoading: true, error: null });
          const finalFilters = { ...get().filters, ...filters };
          const journeys = await journeyService.getMyJourneys(finalFilters);
          set({ 
            journeys, 
            isLoading: false,
            filters: finalFilters 
          });
        } catch (error: any) {
          console.error('Failed to load my journeys:', error);
          set({ 
            error: error.message || 'Failed to load journeys', 
            isLoading: false 
          });
        }
      },

      loadAllJourneys: async (filters?: JourneyFilters) => {
        try {
          set({ isLoading: true, error: null });
          const finalFilters = { ...get().filters, ...filters };
          const journeys = await journeyService.getAllJourneys(finalFilters);
          set({ 
            journeys, 
            isLoading: false,
            filters: finalFilters 
          });
        } catch (error: any) {
          console.error('Failed to load all journeys:', error);
          set({ 
            error: error.message || 'Failed to load journeys', 
            isLoading: false 
          });
        }
      },

      loadJourney: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          const journey = await journeyService.getJourneyById(id);
          set({ currentJourney: journey, isLoading: false });
        } catch (error: any) {
          console.error('Failed to load journey:', error);
          set({ 
            error: error.message || 'Failed to load journey', 
            isLoading: false 
          });
        }
      },

      createJourney: async (data: CreateJourneyDto) => {
        try {
          set({ isCreating: true, error: null });
          const newJourney = await journeyService.createJourney(data);
          
          set((state) => ({
            journeys: [newJourney, ...state.journeys],
            currentJourney: newJourney,
            isCreating: false,
          }));
          
          return newJourney;
        } catch (error: any) {
          console.error('Failed to create journey:', error);
          set({ 
            error: error.message || 'Failed to create journey', 
            isCreating: false 
          });
          return null;
        }
      },

      updateJourney: async (id: string, data: UpdateJourneyDto) => {
        try {
          set({ isUpdating: true, error: null });
          const updatedJourney = await journeyService.updateJourney(id, data);
          
          set((state) => ({
            journeys: state.journeys.map(journey => 
              journey.id === id ? updatedJourney : journey
            ),
            currentJourney: state.currentJourney?.id === id 
              ? updatedJourney 
              : state.currentJourney,
            isUpdating: false,
          }));
          
          return updatedJourney;
        } catch (error: any) {
          console.error('Failed to update journey:', error);
          set({ 
            error: error.message || 'Failed to update journey', 
            isUpdating: false 
          });
          return null;
        }
      },

      deleteJourney: async (id: string) => {
        try {
          set({ isDeleting: true, error: null });
          await journeyService.deleteJourney(id);
          
          set((state) => ({
            journeys: state.journeys.filter(journey => journey.id !== id),
            currentJourney: state.currentJourney?.id === id 
              ? null 
              : state.currentJourney,
            isDeleting: false,
          }));
          
          return true;
        } catch (error: any) {
          console.error('Failed to delete journey:', error);
          set({ 
            error: error.message || 'Failed to delete journey', 
            isDeleting: false 
          });
          return false;
        }
      },

      duplicateJourney: async (id: string, newTitle?: string) => {
        try {
          set({ isCreating: true, error: null });
          const duplicatedJourney = await journeyService.duplicateJourney(id, newTitle);
          
          set((state) => ({
            journeys: [duplicatedJourney, ...state.journeys],
            isCreating: false,
          }));
          
          return duplicatedJourney;
        } catch (error: any) {
          console.error('Failed to duplicate journey:', error);
          set({ 
            error: error.message || 'Failed to duplicate journey', 
            isCreating: false 
          });
          return null;
        }
      },

      // Detailed Journey Management Actions
      loadDetailedJourney: async (id: string) => {
        try {
          set({ isLoadingDetailed: true, error: null });
          const detailedJourney = await journeyService.getDetailedJourney(id);
          set({ detailedJourney, isLoadingDetailed: false });
        } catch (error: any) {
          console.error('Failed to load detailed journey:', error);
          set({ 
            error: error.message || 'Failed to load journey details', 
            isLoadingDetailed: false 
          });
        }
      },

      updateJourneyBanner: async (id: string, banner: JourneyBanner) => {
        try {
          set({ isUpdating: true, error: null });
          const updatedJourney = await journeyService.updateJourneyBanner(id, banner);
          set({ 
            detailedJourney: updatedJourney,
            isUpdating: false 
          });
        } catch (error: any) {
          console.error('Failed to update journey banner:', error);
          set({ 
            error: error.message || 'Failed to update banner', 
            isUpdating: false 
          });
        }
      },

      addDayToJourney: async (id: string, day: { date: string }) => {
        try {
          set({ isUpdating: true, error: null });
          const updatedJourney = await journeyService.addDayToJourney(id, day);
          set({ 
            detailedJourney: updatedJourney,
            isUpdating: false 
          });
        } catch (error: any) {
          console.error('Failed to add day to journey:', error);
          set({ 
            error: error.message || 'Failed to add day', 
            isUpdating: false 
          });
        }
      },

      removeDayFromJourney: async (id: string, dayId: string) => {
        try {
          set({ isUpdating: true, error: null });
          const updatedJourney = await journeyService.removeDayFromJourney(id, dayId);
          set({ 
            detailedJourney: updatedJourney,
            isUpdating: false 
          });
        } catch (error: any) {
          console.error('Failed to remove day from journey:', error);
          set({ 
            error: error.message || 'Failed to remove day', 
            isUpdating: false 
          });
        }
      },

      addActivityToDay: async (journeyId: string, data: AddActivityData) => {
        try {
          set({ isUpdating: true, error: null });
          const newLocation = await journeyService.addActivityToDay(journeyId, data);
          
          // Update the detailed journey state locally
          const state = get();
          if (state.detailedJourney) {
            const updatedJourney = { ...state.detailedJourney };
            const dayIndex = updatedJourney.days.findIndex(day => day.id === data.dayId);
            
            if (dayIndex !== -1) {
              const day = updatedJourney.days[dayIndex];
              const activities = { ...day.activities };
              
              if (activities[data.category]) {
                activities[data.category] = [...activities[data.category], newLocation];
              }
              
              updatedJourney.days[dayIndex] = { ...day, activities };
            }
            
            set({ 
              detailedJourney: updatedJourney,
              isUpdating: false 
            });
          } else {
            set({ isUpdating: false });
          }
          
          return newLocation;
        } catch (error: any) {
          console.error('Failed to add activity:', error);
          set({ 
            error: error.message || 'Failed to add activity', 
            isUpdating: false 
          });
          return null;
        }
      },

      updateActivity: async (journeyId: string, data: UpdateActivityData) => {
        try {
          set({ isUpdating: true, error: null });
          const updatedLocation = await journeyService.updateActivity(journeyId, data);
          
          // Update the detailed journey state locally
          const state = get();
          if (state.detailedJourney) {
            const updatedJourney = { ...state.detailedJourney };
            
            // Find and update the location in all days and categories
            for (let dayIndex = 0; dayIndex < updatedJourney.days.length; dayIndex++) {
              const day = updatedJourney.days[dayIndex];
              const activities = { ...day.activities };
              let locationFound = false;
              
              Object.keys(activities).forEach(category => {
                const categoryKey = category as keyof typeof activities;
                const locationIndex = activities[categoryKey].findIndex(
                  (loc: any) => loc.id === data.locationId
                );
                
                if (locationIndex !== -1) {
                  activities[categoryKey][locationIndex] = updatedLocation;
                  locationFound = true;
                }
              });
              
              if (locationFound) {
                updatedJourney.days[dayIndex] = { ...day, activities };
                break;
              }
            }
            
            set({ 
              detailedJourney: updatedJourney,
              isUpdating: false 
            });
          } else {
            set({ isUpdating: false });
          }
          
          return updatedLocation;
        } catch (error: any) {
          console.error('Failed to update activity:', error);
          set({ 
            error: error.message || 'Failed to update activity', 
            isUpdating: false 
          });
          return null;
        }
      },

      removeActivity: async (journeyId: string, locationId: string) => {
        try {
          set({ isUpdating: true, error: null });
          await journeyService.removeActivity(journeyId, locationId);
          
          // Update the detailed journey state locally
          const state = get();
          if (state.detailedJourney) {
            const updatedJourney = { ...state.detailedJourney };
            
            // Find and remove the location from all days and categories
            for (let dayIndex = 0; dayIndex < updatedJourney.days.length; dayIndex++) {
              const day = updatedJourney.days[dayIndex];
              const activities = { ...day.activities };
              let locationFound = false;
              
              Object.keys(activities).forEach(category => {
                const categoryKey = category as keyof typeof activities;
                const originalLength = activities[categoryKey].length;
                activities[categoryKey] = activities[categoryKey].filter(
                  (loc: any) => loc.id !== locationId
                );
                
                if (activities[categoryKey].length < originalLength) {
                  locationFound = true;
                }
              });
              
              if (locationFound) {
                updatedJourney.days[dayIndex] = { ...day, activities };
                break;
              }
            }
            
            set({ 
              detailedJourney: updatedJourney,
              isUpdating: false 
            });
          } else {
            set({ isUpdating: false });
          }
        } catch (error: any) {
          console.error('Failed to remove activity:', error);
          set({ 
            error: error.message || 'Failed to remove activity', 
            isUpdating: false 
          });
        }
      },

      reorderActivities: async (journeyId: string, dayId: string, locationIds: string[]) => {
        try {
          set({ isUpdating: true, error: null });
          await journeyService.reorderActivities(journeyId, dayId, locationIds);
          
          // This would typically trigger a reload of the detailed journey
          // For now, we'll just clear the updating state
          set({ isUpdating: false });
        } catch (error: any) {
          console.error('Failed to reorder activities:', error);
          set({ 
            error: error.message || 'Failed to reorder activities', 
            isUpdating: false 
          });
        }
      },

      searchLocations: async (query: string, center?: { lat: number; lng: number }) => {
        try {
          const locations = await journeyService.searchLocations(query, center);
          return locations;
        } catch (error: any) {
          console.error('Failed to search locations:', error);
          set({ error: error.message || 'Failed to search locations' });
          return [];
        }
      },

      // Statistics Actions
      loadStats: async (userId?: string) => {
        try {
          set({ isLoadingStats: true, error: null });
          const stats = await journeyService.getJourneyStats(userId);
          set({ stats, isLoadingStats: false });
        } catch (error: any) {
          console.error('Failed to load journey stats:', error);
          set({ 
            error: error.message || 'Failed to load statistics', 
            isLoadingStats: false 
          });
        }
      },

      // Search and Filtering Actions
      searchJourneys: async (query: string) => {
        try {
          set({ isLoading: true, error: null, searchQuery: query });
          const filters = get().filters;
          const journeys = await journeyService.searchJourneys(query, filters);
          set({ journeys, isLoading: false });
        } catch (error: any) {
          console.error('Failed to search journeys:', error);
          set({ 
            error: error.message || 'Failed to search journeys', 
            isLoading: false 
          });
        }
      },

      setFilters: (newFilters: Partial<JourneyFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }));
      },

      resetFilters: () => {
        set({ filters: initialFilters });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      // UI State Actions
      clearError: () => {
        set({ error: null });
      },

      setCurrentJourney: (journey: Journey | null) => {
        set({ currentJourney: journey });
      },

      setDetailedJourney: (journey: DetailedJourney | null) => {
        set({ detailedJourney: journey });
      },

      reset: () => {
        set({
          journeys: [],
          currentJourney: null,
          detailedJourney: null,
          stats: null,
          filters: initialFilters,
          searchQuery: '',
          isLoading: false,
          isCreating: false,
          isUpdating: false,
          isDeleting: false,
          isLoadingStats: false,
          isLoadingDetailed: false,
          error: null,
        });
      },
    }),
    {
      name: 'journey-store',
      partialize: (state) => ({
        // Only persist filters and search query, not the journey data
        filters: state.filters,
        searchQuery: state.searchQuery,
      }),
    }
  )
);
