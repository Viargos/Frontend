export type DashboardPostUser = {
  id: string;
  username: string;
  profileImage?: string;
};

export type DashboardPostMedia = {
  id: string;
  kind: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
};

export type DashboardPostComment = {
  id: string;
  content: string;
  createdAt: string;
  userId?: string;
  user?: DashboardPostUser;
  isPending?: boolean;
};

export type DashboardPost = {
  id: string;
  description: string;
  likeCount: number;
  commentCount: number;
  comments?: DashboardPostComment[];
  location?: string;
  createdAt: string;
  isLikedByCurrentUser: boolean;
  user: DashboardPostUser;
  media: DashboardPostMedia[];
  journey?: {
    id: string;
    title: string;
  };
};

export type DashboardFeedModel = {
  posts: DashboardPost[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount?: number;
};

export type DashboardProfileRecommendation = {
  category?: string;
  descriptor: string;
  followersCount: number;
  id: string;
  isFollowing: boolean;
  postsCount: number;
  profileImage?: string;
  username: string;
};

export type DashboardJourneyRecommendation = {
  coverImage?: string;
  createdAt: string;
  creator: {
    id: string;
    username: string;
  };
  daysCount: number;
  description?: string;
  id: string;
  placesCount: number;
  title: string;
};

export type DashboardPostCreationJourneyOption = {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  createdAt: string;
};
