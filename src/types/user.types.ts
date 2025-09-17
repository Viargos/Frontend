export interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  bannerImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserSearchResponse {
  statusCode: number;
  message: string;
  data: User[];
}

export interface UserSearchParams {
  q: string;
  limit?: number;
}

export interface UserStats {
  followersCount: number;
  followingCount: number;
  postsCount: number;
  journeysCount: number;
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

export interface RelationshipStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
}

export interface RecentPost {
  id: string;
  description: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  mediaUrls: string[];
}

export interface UserDetailsData {
  user: User;
  stats: UserStats;
  relationshipStatus: RelationshipStatus;
  recentFollowers: User[];
  recentFollowing: User[];
  recentPosts: RecentPost[];
  recentJourneys: RecentJourney[];
}

export interface UserDetailsResponse {
  statusCode: number;
  message: string;
  data: UserDetailsData;
}

// Location and nearby journeys types
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface NearbyJourneysParams {
  latitude: number;
  longitude: number;
  radius: number;
  limit?: number;
}

export interface NearbyJourneysResponse {
  statusCode: number;
  message: string;
  data: any[]; // Using any[] since we don't have the exact journey structure for nearby
}

export interface GeolocationState {
  coordinates: LocationCoordinates | null;
  isLoading: boolean;
  error: string | null;
  isSupported: boolean;
}
