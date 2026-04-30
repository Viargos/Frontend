export type DashboardQueryDto = {
  cursor?: string;
  limit?: number;
  location?: string;
  search?: string;
};

export type DashboardRecommendationsQueryDto = {
  excludeUserIds?: string[];
  limit?: number;
};

export type DashboardJourneyRecommendationsQueryDto = {
  limit?: number;
};

export type DashboardPostUserDto = {
  id: string;
  username: string;
  profileImage?: string | null;
};

export type DashboardPostMediaDto = {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string | null;
};

export type DashboardPostJourneyDto = {
  id: string;
  title: string;
};

export type DashboardPostCommentDto = {
  id: string;
  content: string;
  createdAt: string;
  userId?: string;
  user?: DashboardPostUserDto;
};

export type DashboardPostDto = {
  id: string;
  description: string;
  likeCount: number;
  commentCount: number;
  comments?: DashboardPostCommentDto[];
  location?: string | null;
  createdAt: string;
  isLikedByUser?: boolean;
  user: DashboardPostUserDto;
  media: DashboardPostMediaDto[];
  journey?: DashboardPostJourneyDto | null;
};

export type DashboardFeedDto = {
  posts: DashboardPostDto[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount?: number;
};

export type DashboardProfileRecommendationDto = {
  category?: string | null;
  descriptor: string;
  followersCount: number;
  id: string;
  isFollowing: boolean;
  postsCount: number;
  profileImage?: string | null;
  username: string;
};

export type DashboardRecommendationsResponseDto = {
  profiles: DashboardProfileRecommendationDto[];
};

export type DashboardJourneyRecommendationDto = {
  coverImage?: string | null;
  createdAt: string;
  creator: {
    id: string;
    username: string;
  };
  daysCount: number;
  description?: string | null;
  id: string;
  placesCount: number;
  title: string;
};

export type DashboardJourneyRecommendationsResponseDto = {
  journeys: DashboardJourneyRecommendationDto[];
};

export type DashboardLikeResponseDto = {
  success: boolean;
  likeCount: number;
  isLiked: boolean;
};

export type DashboardAddCommentRequestDto = {
  content: string;
  parentId?: string;
};

export type DashboardCommentDto = {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  user?: DashboardPostUserDto;
};

export type DashboardCreatePostRequestDto = {
  description: string;
  journeyId?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
};

export type DashboardCreatePostResponseDto = {
  id: string;
  description: string;
  likeCount?: number;
  commentCount?: number;
  location?: string | null;
  createdAt?: string;
  isLikedByUser?: boolean;
  user?: DashboardPostUserDto;
  media?: DashboardPostMediaDto[];
  journey?: DashboardPostJourneyDto | null;
};

export type DashboardAddPostMediaRequestDto = {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  order?: number;
};

export type DashboardUploadPostMediaResponseDto = {
  imageUrl: string;
  message: string;
};

export type DashboardPostCreationJourneyOptionDto = {
  id: string;
  title: string;
  description: string;
  coverImage?: string | null;
  createdAt: string;
};
