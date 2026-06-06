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

export type ProfilePostJourney = {
  id: string;
  title: string;
};

export type ProfilePost = {
  id: string;
  description: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  mediaUrls: string[];
  journey?: ProfilePostJourney | null;
};

export type ProfilePostCommentUser = {
  id: string;
  username: string;
  profileImage?: string;
};

export type ProfilePostComment = {
  id: string;
  content: string;
  createdAt: string;
  userId?: string;
  user?: ProfilePostCommentUser;
  isPending?: boolean;
};

export type PostMediaItem = {
  id: string;
  url: string;
  type: string;
  order: number;
};

export type PostDetail = {
  id: string;
  description: string;
  journeyId?: string | null;
  location?: string | null;
  media: PostMediaItem[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
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
