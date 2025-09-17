import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ProfileState,
  ProfileTab,
  UserProfile,
  ProfileUpdateData,
  ImageUploadResult,
} from "@/types/profile.types";
import { RecentPost } from "@/types/user.types";
import { serviceFactory } from "@/lib/services/service-factory";
import { ApiError } from "@/lib/interfaces/http-client.interface";

interface ProfileStore extends ProfileState {
  // Actions
  setActiveTab: (tab: ProfileTab) => void;
  loadProfile: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadProfileAndStats: () => Promise<void>;
  updateProfile: (
    data: ProfileUpdateData
  ) => Promise<{ success: boolean; error?: string }>;
  uploadProfileImage: (file: File) => Promise<ImageUploadResult>;
  uploadBannerImage: (file: File) => Promise<ImageUploadResult>;
  deleteProfileImage: () => Promise<{ success: boolean; error?: string }>;
  deleteBannerImage: () => Promise<{ success: boolean; error?: string }>;
  deleteJourney: (
    journeyId: string
  ) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;

  // Helper methods
  extractErrorMessage: (error: unknown) => string;
}

const initialState: ProfileState = {
  profile: null,
  stats: null,
  recentJourneys: [],
  recentPosts: [],
  profileImageUrl: null,
  bannerImageUrl: null,
  isLoading: false,
  isStatsLoading: false,
  isImageUploading: false,
  error: null,
  activeTab: "journey",
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Tab management
      setActiveTab: (tab: ProfileTab) => {
        set({ activeTab: tab });
      },

      // Combined profile and stats loading (optimized)
      loadProfileAndStats: async (): Promise<void> => {
        try {
          set({ isLoading: true, isStatsLoading: true, error: null });

          const response =
            await serviceFactory.profileService.getCurrentUserProfileWithJourneys();

          if (response.data) {
            const { profile, stats, recentJourneys, recentPosts } = response.data;
            set({
              profile,
              stats,
              recentJourneys,
              recentPosts,
              profileImageUrl: profile.profileImage || null,
              bannerImageUrl: profile.bannerImage || null,
            });
          } else {
            throw new Error("Failed to load profile data");
          }
        } catch (error) {
          const errorMessage = get().extractErrorMessage(error);
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false, isStatsLoading: false });
        }
      },

      // Profile management (kept for backward compatibility)
      loadProfile: async (): Promise<void> => {
        try {
          set({ isLoading: true, error: null });

          const response =
            await serviceFactory.profileService.getCurrentUserProfile();

          if (response.data) {
            const profile = response.data as UserProfile;
            set({
              profile,
              profileImageUrl: profile.profileImage || null,
              bannerImageUrl: profile.bannerImage || null,
            });
          }
        } catch (error) {
          const errorMessage = get().extractErrorMessage(error);
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      // Stats management
      loadStats: async (): Promise<void> => {
        try {
          set({ isStatsLoading: true, error: null });

          const response =
            await serviceFactory.profileService.getCurrentUserStats();

          if (response.data) {
            set({ stats: response.data });
          }
        } catch (error) {
          const errorMessage = get().extractErrorMessage(error);
          set({ error: errorMessage });
        } finally {
          set({ isStatsLoading: false });
        }
      },

      // Profile updates
      updateProfile: async (
        data: ProfileUpdateData
      ): Promise<{ success: boolean; error?: string }> => {
        try {
          set({ isLoading: true, error: null });

          const response = await serviceFactory.profileService.updateProfile(
            data
          );

          if (response.data) {
            const updatedProfile = response.data as UserProfile;
            set({ profile: updatedProfile });
            return { success: true };
          }

          return { success: false, error: "Failed to update profile" };
        } catch (error) {
          const errorMessage = get().extractErrorMessage(error);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      // Image uploads
      uploadProfileImage: async (file: File): Promise<ImageUploadResult> => {
        try {
          set({ isImageUploading: true, error: null });

          const response =
            await serviceFactory.profileService.uploadProfileImage(file);

          if (response.data) {
            const { imageUrl } = response.data;
            set({ profileImageUrl: imageUrl });

            // Update profile object if it exists
            const currentProfile = get().profile;
            if (currentProfile) {
              set({
                profile: { ...currentProfile, profileImage: imageUrl },
              });
            }

            return { success: true, imageUrl };
          }

          return { success: false, error: "Failed to upload profile image" };
        } catch (error) {
          const errorMessage = get().extractErrorMessage(error);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isImageUploading: false });
        }
      },

      uploadBannerImage: async (file: File): Promise<ImageUploadResult> => {
        try {
          set({ isImageUploading: true, error: null });

          const response =
            await serviceFactory.profileService.uploadBannerImage(file);

          if (response.data) {
            const { imageUrl } = response.data;
            set({ bannerImageUrl: imageUrl });

            // Update profile object if it exists
            const currentProfile = get().profile;
            if (currentProfile) {
              set({
                profile: { ...currentProfile, bannerImage: imageUrl },
              });
            }

            return { success: true, imageUrl };
          }

          return { success: false, error: "Failed to upload banner image" };
        } catch (error) {
          const errorMessage = get().extractErrorMessage(error);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isImageUploading: false });
        }
      },

      // Image deletions
      deleteProfileImage: async (): Promise<{
        success: boolean;
        error?: string;
      }> => {
        try {
          set({ isImageUploading: true, error: null });

          await serviceFactory.profileService.deleteProfileImage();

          set({ profileImageUrl: null });

          // Update profile object if it exists
          const currentProfile = get().profile;
          if (currentProfile) {
            set({
              profile: { ...currentProfile, profileImage: undefined },
            });
          }

          return { success: true };
        } catch (error) {
          const errorMessage = get().extractErrorMessage(error);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isImageUploading: false });
        }
      },

      deleteBannerImage: async (): Promise<{
        success: boolean;
        error?: string;
      }> => {
        try {
          set({ isImageUploading: true, error: null });

          await serviceFactory.profileService.deleteBannerImage();

          set({ bannerImageUrl: null });

          // Update profile object if it exists
          const currentProfile = get().profile;
          if (currentProfile) {
            set({
              profile: { ...currentProfile, bannerImage: undefined },
            });
          }

          return { success: true };
        } catch (error) {
          const errorMessage = get().extractErrorMessage(error);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isImageUploading: false });
        }
      },

      // Journey management
      deleteJourney: async (
        journeyId: string
      ): Promise<{ success: boolean; error?: string }> => {
        try {
          set({ isLoading: true, error: null });

          await serviceFactory.journeyService.deleteJourney(journeyId);

          // Remove the journey from recentJourneys list
          const currentJourneys = get().recentJourneys;
          const updatedJourneys = currentJourneys.filter(
            (journey) => journey.id !== journeyId
          );

          set({ recentJourneys: updatedJourneys });

          return { success: true };
        } catch (error) {
          const errorMessage = get().extractErrorMessage(error);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      // Utility methods
      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      reset: () => {
        set(initialState);
      },

      // Helper method to extract error messages consistently
      extractErrorMessage: (error: unknown): string => {
        if (error instanceof ApiError) {
          return error.message;
        }

        if (error instanceof Error) {
          return error.message;
        }

        if (typeof error === "string") {
          return error;
        }

        return "An unexpected error occurred";
      },
    }),
    {
      name: "viargos-profile-storage",
      partialize: (state) => ({
        activeTab: state.activeTab,
        // Don't persist sensitive data like profile images URLs
      }),
    }
  )
);
