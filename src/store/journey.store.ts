import { create } from "zustand";
import {
  Journey,
  CreateJourneyDto,
  UpdateJourneyDto,
} from "@/types/journey.types";
import apiClient from "@/lib/api";

interface JourneyState {
  journeys: Journey[];
  currentJourney: Journey | null;
  isLoading: boolean;
  error: string | null;
}

interface JourneyStore extends JourneyState {
  // Actions
  fetchMyJourneys: () => Promise<void>;
  fetchAllJourneys: () => Promise<void>;
  fetchJourney: (id: string) => Promise<void>;
  createJourney: (data: CreateJourneyDto) => Promise<void>;
  updateJourney: (id: string, data: UpdateJourneyDto) => Promise<void>;
  deleteJourney: (id: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useJourneyStore = create<JourneyStore>((set, get) => ({
  // Initial state
  journeys: [],
  currentJourney: null,
  isLoading: false,
  error: null,

  // Actions
  fetchMyJourneys: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.getMyJourneys();
      set({ journeys: response.data || [], isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch journeys";
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchAllJourneys: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.getAllJourneys();
      set({ journeys: response.data || [], isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch journeys";
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchJourney: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.getJourney(id);
      set({ currentJourney: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch journey";
      set({ error: errorMessage, isLoading: false });
    }
  },

  createJourney: async (data: CreateJourneyDto) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.createJourney(data);
      const newJourney = response.data;
      set((state) => ({
        journeys: [...state.journeys, newJourney],
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create journey";
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateJourney: async (id: string, data: UpdateJourneyDto) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.updateJourney(id, data);
      const updatedJourney = response.data;
      set((state) => ({
        journeys: state.journeys.map((journey) =>
          journey.id === id ? updatedJourney : journey
        ),
        currentJourney:
          state.currentJourney?.id === id
            ? updatedJourney
            : state.currentJourney,
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update journey";
      set({ error: errorMessage, isLoading: false });
    }
  },

  deleteJourney: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await apiClient.deleteJourney(id);
      set((state) => ({
        journeys: state.journeys.filter((journey) => journey.id !== id),
        currentJourney:
          state.currentJourney?.id === id ? null : state.currentJourney,
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete journey";
      set({ error: errorMessage, isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
