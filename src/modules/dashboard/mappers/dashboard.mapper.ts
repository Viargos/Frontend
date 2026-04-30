import type {
  DashboardCreatePostResponseDto,
  DashboardFeedDto,
  DashboardJourneyRecommendationDto,
  DashboardPostCreationJourneyOptionDto,
  DashboardPostDto,
  DashboardProfileRecommendationDto,
} from '@/modules/dashboard/dto/dashboard.dto';
import type {
  DashboardFeedModel,
  DashboardJourneyRecommendation,
  DashboardPost,
  DashboardPostCreationJourneyOption,
  DashboardProfileRecommendation,
} from '@/modules/dashboard/types/dashboard.types';

function mapPost(dto: DashboardPostDto): DashboardPost {
  if (!dto.user || typeof dto.user.id !== 'string' || typeof dto.user.username !== 'string') {
    throw new Error('Invalid dashboard post user payload');
  }

  return {
    commentCount: dto.commentCount,
    comments: (dto.comments ?? []).map(comment => ({
      content: comment.content,
      createdAt: comment.createdAt,
      id: comment.id,
      userId: comment.userId,
      user: comment.user
        ? {
            id: comment.user.id,
            profileImage: comment.user.profileImage ?? undefined,
            username: comment.user.username,
          }
        : undefined,
    })),
    createdAt: dto.createdAt,
    description: dto.description,
    id: dto.id,
    isLikedByCurrentUser: dto.isLikedByUser ?? false,
    journey: dto.journey
      ? {
          id: dto.journey.id,
          title: dto.journey.title,
        }
      : undefined,
    likeCount: dto.likeCount,
    location: dto.location ?? undefined,
    media: (dto.media ?? []).map(media => ({
      id: media.id,
      kind: media.type,
      thumbnailUrl: media.thumbnailUrl ?? undefined,
      url: media.url,
    })),
    user: {
      id: dto.user.id,
      profileImage: dto.user.profileImage ?? undefined,
      username: dto.user.username,
    },
  };
}

export function mapDashboardFeed(dto: DashboardFeedDto): DashboardFeedModel {
  return {
    hasMore: dto.hasMore,
    nextCursor: dto.nextCursor,
    posts: (dto.posts ?? []).map(mapPost),
    totalCount: dto.totalCount,
  };
}

export function mapDashboardRecommendation(
  dto: DashboardProfileRecommendationDto,
): DashboardProfileRecommendation {
  return {
    category: dto.category ?? undefined,
    descriptor: dto.descriptor,
    followersCount: dto.followersCount,
    id: dto.id,
    isFollowing: dto.isFollowing,
    postsCount: dto.postsCount,
    profileImage: dto.profileImage ?? undefined,
    username: dto.username,
  };
}

export function mapDashboardRecommendations(
  dtos: DashboardProfileRecommendationDto[],
): DashboardProfileRecommendation[] {
  return dtos.map(mapDashboardRecommendation);
}

export function mapDashboardJourneyRecommendation(
  dto: DashboardJourneyRecommendationDto,
): DashboardJourneyRecommendation {
  return {
    coverImage: dto.coverImage ?? undefined,
    createdAt: dto.createdAt,
    creator: dto.creator,
    daysCount: dto.daysCount,
    description: dto.description ?? undefined,
    id: dto.id,
    placesCount: dto.placesCount,
    title: dto.title,
  };
}

export function mapDashboardJourneyRecommendations(
  dtos: DashboardJourneyRecommendationDto[],
): DashboardJourneyRecommendation[] {
  return dtos.map(mapDashboardJourneyRecommendation);
}

export function mapCreatePostToDashboardPost(
  dto: DashboardCreatePostResponseDto,
  fallback: Pick<DashboardPost, 'user' | 'media'>,
): DashboardPost {
  return {
    commentCount: dto.commentCount ?? 0,
    comments: [],
    createdAt: dto.createdAt ?? new Date().toISOString(),
    description: dto.description,
    id: dto.id,
    isLikedByCurrentUser: dto.isLikedByUser ?? false,
    journey: dto.journey
      ? {
          id: dto.journey.id,
          title: dto.journey.title,
        }
      : undefined,
    likeCount: dto.likeCount ?? 0,
    location: dto.location ?? undefined,
    media: dto.media
      ? dto.media.map(media => ({
          id: media.id,
          kind: media.type,
          thumbnailUrl: media.thumbnailUrl ?? undefined,
          url: media.url,
        }))
      : fallback.media,
    user: dto.user
      ? {
          id: dto.user.id,
          profileImage: dto.user.profileImage ?? undefined,
          username: dto.user.username,
        }
      : fallback.user,
  };
}

export function mapJourneyCreationOption(
  dto: DashboardPostCreationJourneyOptionDto,
): DashboardPostCreationJourneyOption {
  return {
    coverImage: dto.coverImage ?? undefined,
    createdAt: dto.createdAt,
    description: dto.description,
    id: dto.id,
    title: dto.title,
  };
}
