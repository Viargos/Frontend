export type ProfileUser = {
  id: string;
  username: string;
  email?: string;
  bio?: string;
  location?: string;
  profileImage?: string;
  bannerImage?: string;
  createdAt?: string;
};

export type ProfileStats = {
  followers: number;
  following: number;
  posts: number;
  journeys: number;
};

export type ProfileRelationship = {
  isFollowing: boolean;
  isFollowedBy: boolean;
};

export type ProfilePost = {
  id: string;
  description: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  mediaUrls: string[];
};

export type ProfileJourney = {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  daysCount: number;
  createdAt: string;
  previewPlaces: string[];
};

export type UserProfile = {
  user: ProfileUser;
  stats: ProfileStats;
  relationship: ProfileRelationship;
  recentPosts: ProfilePost[];
  recentJourneys: ProfileJourney[];
};
