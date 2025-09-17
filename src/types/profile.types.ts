export interface UserStats {
  posts: number;
  journeys: number;
  followers: number;
  following: number;
}

export interface RecentJourney {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  daysCount: number;
  createdAt: string;
  author: {
    id: string;
    username: string;
    profileImage: string | null;
  };
  previewPlaces: string[];
  type: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  profileImage?: string;
  bannerImage?: string;
  location?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileState {
  profile: UserProfile | null;
  stats: UserStats | null;
  recentJourneys: RecentJourney[];
  recentPosts: import('@/types/user.types').RecentPost[];
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  isLoading: boolean;
  isStatsLoading: boolean;
  isImageUploading: boolean;
  error: string | null;
  activeTab: ProfileTab;
}

export type ProfileTab = 'journey' | 'post' | 'map';

export interface ProfileUpdateData {
  username?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
}

export interface ImageUploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface ProfileTabConfig {
  id: ProfileTab;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}
