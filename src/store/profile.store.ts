import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ProfileState,
  ProfileTab,
  UserProfile,
  UserStats,
  RecentJourney,
  ProfileUpdateData,
  ImageUploadResult,
} from "@/types/profile.types";
import { RecentPost } from "@/types/user.types";
import { ApiError } from "@/lib/interfaces/http-client.interface";
import { UserApi, JourneyApi } from "@/lib/api";
import type { UserDto } from "@/lib/dtos/user/user.dto";
import type { UserStatsDto } from "@/lib/dtos/user/user-stats.dto";
import type { JourneySummaryDto } from "@/lib/dtos/user/journey-summary.dto";
import type { PostSummaryDto } from "@/lib/dtos/user/post-summary.dto";

function mapUserDtoToProfile(user: UserDto): UserProfile {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    bio: "",
    location: "",
    isActive: true,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
    profileImage: user.profileImage,
    bannerImage: user.bannerImage,
  };
}

function mapStatsDtoToStats(stats: UserStatsDto): UserStats {
  return {
    posts: stats.postsCount ?? 0,
    journeys: stats.journeysCount ?? 0,
    followers: stats.followersCount ?? 0,
    following: stats.followingCount ?? 0,
  };
}

function mapJourneySummaryToRecent(j: JourneySummaryDto | undefined | null): RecentJourney {
  if (!j) return { id: "", title: "", description: "", coverImage: null, daysCount: 0, createdAt: "", author: { id: "", username: "", profileImage: null }, previewPlaces: [], type: "" };
  return {
    id: j.id ?? "",
    title: j.title ?? "",
    description: j.description ?? "",
    coverImage: j.coverImage ?? null,
    daysCount: j.daysCount ?? 0,
    createdAt: typeof j.createdAt === "string" ? j.createdAt : j.createdAt?.toISOString?.() ?? "",
    author: {
      id: j.author?.id ?? "",
      username: j.author?.username ?? "",
      profileImage: j.author?.profileImage ?? null,
    },
    previewPlaces: Array.isArray(j.previewPlaces) ? j.previewPlaces : [],
    type: j.type ?? "",
  };
}

function mapPostSummaryToRecent(p: PostSummaryDto | undefined | null): RecentPost {
  if (!p) return { id: "", description: "", likeCount: 0, commentCount: 0, createdAt: "", mediaUrls: [] };
  return {
    id: p.id ?? "",
    description: p.description ?? "",
    likeCount: p.likeCount ?? 0,
    commentCount: p.commentCount ?? 0,
    createdAt: typeof p.createdAt === "string" ? p.createdAt : (p.createdAt as Date)?.toISOString?.() ?? "",
    mediaUrls: Array.isArray(p.mediaUrls) ? p.mediaUrls : [],
  };
}

/** Extract user object from /api/user/me response (backend may wrap in data or return at top level). */
function extractUserFromProfileResponse(data: Record<string, unknown>): UserDto | null {
  if (!data) return null;
  const nested = data.data as Record<string, unknown> | undefined;
  if (nested?.user && typeof nested.user === "object")
    return nested.user as UserDto;
  if (data.user && typeof data.user === "object") return data.user as UserDto;
  if (typeof data.id === "string" && typeof data.username === "string") return data as unknown as UserDto;
  return null;
}

/** Extract stats from profile response. */
function extractStatsFromProfileResponse(data: Record<string, unknown>): UserStatsDto | null {
  if (!data) return null;
  const nested = data.data as Record<string, unknown> | undefined;
  const stats = (nested?.stats ?? data.stats) as UserStatsDto | undefined;
  if (stats && typeof stats === "object") return stats;
  return null;
}

/** Extract recentJourneys array from profile response. */
function extractRecentJourneysFromProfileResponse(data: Record<string, unknown>): JourneySummaryDto[] {
  const nested = data.data as Record<string, unknown> | undefined;
  const arr = (nested?.recentJourneys ?? data.recentJourneys) as JourneySummaryDto[] | undefined;
  return Array.isArray(arr) ? arr : [];
}

/** Extract recentPosts array from profile response. */
function extractRecentPostsFromProfileResponse(data: Record<string, unknown>): PostSummaryDto[] {
  const nested = data.data as Record<string, unknown> | undefined;
  const arr = (nested?.recentPosts ?? data.recentPosts) as PostSummaryDto[] | undefined;
  return Array.isArray(arr) ? arr : [];
}

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

      // Combined profile and stats loading (cookie-based auth via same-origin /api/user/me)
      loadProfileAndStats: async (): Promise<void> => {
        try {
          set({ isLoading: true, isStatsLoading: true, error: null });

          const data = await UserApi.getProfile();
          const raw = data as unknown as Record<string, unknown>;

          const user = extractUserFromProfileResponse(raw);
          if (!user) {
            set({ error: "Invalid profile response: user data missing" });
            return;
          }

          const profile = mapUserDtoToProfile(user);
          const statsDto = extractStatsFromProfileResponse(raw);
          const stats = mapStatsDtoToStats(statsDto ?? { followersCount: 0, followingCount: 0, postsCount: 0, journeysCount: 0 });
          const recentJourneys = extractRecentJourneysFromProfileResponse(raw).map(mapJourneySummaryToRecent);
          const recentPosts = extractRecentPostsFromProfileResponse(raw).map(mapPostSummaryToRecent);

          set({
            profile,
            stats,
            recentJourneys,
            recentPosts,
            profileImageUrl: profile.profileImage != null ? profile.profileImage : null,
            bannerImageUrl: profile.bannerImage != null ? profile.bannerImage : null,
          });
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

          const data = await UserApi.getCurrentUserProfile();
          const raw = data as unknown as Record<string, unknown>;

          const user = extractUserFromProfileResponse(raw);
          if (user) {
            const profile = mapUserDtoToProfile(user);
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

          const data = await UserApi.getCurrentUserStats();
          const raw = data as unknown as Record<string, unknown>;

          const statsDto = extractStatsFromProfileResponse(raw);
          if (statsDto) {
            const stats = mapStatsDtoToStats(statsDto);
            set({ stats });
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

          const response = await UserApi.updateProfile(data);
          const raw = response as unknown as Record<string, unknown>;

          const user = extractUserFromProfileResponse(raw);
          if (user) {
            const updatedProfile = mapUserDtoToProfile(user);
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

          const response = await UserApi.uploadProfileImage(file);
          const { imageUrl } = response;

          set({ profileImageUrl: imageUrl });

          // Update profile object if it exists
          const currentProfile = get().profile;
          if (currentProfile) {
            set({
              profile: { ...currentProfile, profileImage: imageUrl },
            });
          }

          return { success: true, imageUrl };
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

          const response = await UserApi.uploadBannerImage(file);
          const { imageUrl } = response;

          set({ bannerImageUrl: imageUrl });

          // Update profile object if it exists
          const currentProfile = get().profile;
          if (currentProfile) {
            set({
              profile: { ...currentProfile, bannerImage: imageUrl },
            });
          }

          return { success: true, imageUrl };
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

          await UserApi.deleteProfileImage();

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

          await UserApi.deleteBannerImage();

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

          await JourneyApi.deleteJourney(journeyId);

          // Remove the journey from recentJourneys list
          const currentJourneys = get().recentJourneys;
          const updatedJourneys = currentJourneys.filter(
            (journey) => journey.id !== journeyId
          );

          // Update stats - decrement journeys count
          const currentStats = get().stats;
          const updatedStats = currentStats ? {
            ...currentStats,
            journeys: Math.max(0, currentStats.journeys - 1)
          } : null;

          set({
            recentJourneys: updatedJourneys,
            stats: updatedStats
          });

          return { success: true };
        } catch (error) {
          const errorMessage = get().extractErrorMessage(error);

          // Handle "Journey not found" gracefully - treat as success since journey is already deleted
          if (errorMessage.toLowerCase().includes('journey not found')) {
            // Remove from local state anyway since it's already deleted
            const currentJourneys = get().recentJourneys;
            const updatedJourneys = currentJourneys.filter(
              (journey) => journey.id !== journeyId
            );

            // Update stats - decrement journeys count
            const currentStats = get().stats;
            const updatedStats = currentStats ? {
              ...currentStats,
              journeys: Math.max(0, currentStats.journeys - 1)
            } : null;

            set({
              recentJourneys: updatedJourneys,
              stats: updatedStats
            });
            return { success: true };
          }

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
