export type UserDto = {
  id: string;
  username: string;
  email?: string;
  bio?: string;
  location?: string;
  profileImage?: string | null;
  bannerImage?: string | null;
  createdAt?: string;
};

export type ProfileStatsDto = {
  followersCount: number;
  followingCount: number;
  postsCount: number;
  journeysCount: number;
};

export type RelationshipStatusDto = {
  isFollowing: boolean;
  isFollowedBy: boolean;
};

export type PostSummaryDto = {
  id: string;
  description: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  mediaUrls: string[];
};

export type JourneySummaryDto = {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  daysCount: number;
  createdAt: string;
  author: {
    id: string;
    username: string;
    profileImage?: string;
  };
  previewPlaces: string[];
  type?: string;
};

export type UserProfileResponseDto = {
  user: UserDto;
  stats: ProfileStatsDto;
  relationshipStatus: RelationshipStatusDto;
  recentFollowers: UserDto[];
  recentFollowing: UserDto[];
  recentPosts: PostSummaryDto[];
  recentJourneys: JourneySummaryDto[];
};
