import type {
  DashboardAddCommentRequestDto,
  DashboardAddPostMediaRequestDto,
  DashboardCommentDto,
  DashboardCreatePostRequestDto,
  DashboardCreatePostResponseDto,
  DashboardFeedDto,
  DashboardJourneyRecommendationDto,
  DashboardJourneyRecommendationsQueryDto,
  DashboardLikeResponseDto,
  DashboardPostCreationJourneyOptionDto,
  DashboardProfileRecommendationDto,
  DashboardQueryDto,
  DashboardRecommendationsQueryDto,
  DashboardUploadPostMediaResponseDto,
} from '@/modules/dashboard/dto/dashboard.dto';
import type {
  DashboardFeedModel,
  DashboardJourneyRecommendation,
  DashboardPostComment,
  DashboardPostCreationJourneyOption,
  DashboardProfileRecommendation,
} from '@/modules/dashboard/types/dashboard.types';
import { httpClient } from '@/lib/api/http-client';
import { unwrapEnvelope } from '@/modules/common/mappers';
import { DASHBOARD_DEFAULT_LIMIT } from '@/modules/dashboard/constants/dashboard.constants';
import {
  mapDashboardFeed,
  mapDashboardJourneyRecommendations,
  mapDashboardRecommendations,
  mapJourneyCreationOption,
} from '@/modules/dashboard/mappers/dashboard.mapper';

type DashboardPostsPageParams = {
  page?: number;
} & DashboardQueryDto;

function toQueryString(query: DashboardPostsPageParams): string {
  const params = new URLSearchParams();

  if (query.cursor) {
    params.set('cursor', query.cursor);
  }

  params.set('limit', String(query.limit ?? DASHBOARD_DEFAULT_LIMIT));

  if (query.location) {
    params.set('location', query.location);
  }

  if (query.search) {
    params.set('search', query.search);
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

async function fetchDashboardEnvelope(query: DashboardQueryDto): Promise<DashboardFeedDto> {
  const payload = await httpClient.get<unknown>(`/dashboard${toQueryString(query)}`);
  return unwrapEnvelope<DashboardFeedDto>(payload).data;
}

function isDashboardRecommendationDto(value: unknown): value is DashboardProfileRecommendationDto {
  return (
    typeof value === 'object'
    && value !== null
    && 'id' in value
    && typeof value.id === 'string'
    && 'username' in value
    && typeof value.username === 'string'
    && 'descriptor' in value
    && typeof value.descriptor === 'string'
    && 'followersCount' in value
    && typeof value.followersCount === 'number'
    && 'postsCount' in value
    && typeof value.postsCount === 'number'
    && 'isFollowing' in value
    && typeof value.isFollowing === 'boolean'
  );
}

function isDashboardJourneyRecommendationDto(value: unknown): value is DashboardJourneyRecommendationDto {
  return (
    typeof value === 'object'
    && value !== null
    && 'id' in value
    && typeof value.id === 'string'
    && 'title' in value
    && typeof value.title === 'string'
    && 'createdAt' in value
    && typeof value.createdAt === 'string'
    && 'daysCount' in value
    && typeof value.daysCount === 'number'
    && 'placesCount' in value
    && typeof value.placesCount === 'number'
    && 'creator' in value
    && typeof value.creator === 'object'
    && value.creator !== null
    && 'id' in value.creator
    && typeof value.creator.id === 'string'
    && 'username' in value.creator
    && typeof value.creator.username === 'string'
  );
}

function unwrapData<TData>(payload: unknown): TData {
  return unwrapEnvelope<TData>(payload).data;
}

function isDashboardCommentDto(value: unknown): value is DashboardCommentDto {
  return (
    typeof value === 'object'
    && value !== null
    && 'id' in value
    && typeof value.id === 'string'
    && 'postId' in value
    && typeof value.postId === 'string'
    && 'userId' in value
    && typeof value.userId === 'string'
    && 'content' in value
    && typeof value.content === 'string'
    && 'replyCount' in value
    && typeof value.replyCount === 'number'
    && 'createdAt' in value
    && typeof value.createdAt === 'string'
    && 'updatedAt' in value
    && typeof value.updatedAt === 'string'
    && (!('parentId' in value) || value.parentId === null || typeof value.parentId === 'string')
  );
}

function parseAddCommentResponse(payload: unknown): DashboardCommentDto {
  const data = unwrapData<unknown>(payload);

  if (isDashboardCommentDto(data)) {
    return data;
  }

  if (
    typeof data === 'object'
    && data !== null
    && 'comment' in data
    && isDashboardCommentDto(data.comment)
  ) {
    return data.comment;
  }

  throw new Error('Invalid add comment response payload');
}

function parseJourneyCreationOptions(payload: unknown): DashboardPostCreationJourneyOptionDto[] {
  const envelope = unwrapData<unknown>(payload);

  if (Array.isArray(envelope)) {
    return envelope as DashboardPostCreationJourneyOptionDto[];
  }

  if (typeof envelope === 'object' && envelope !== null) {
    if ('items' in envelope && Array.isArray(envelope.items)) {
      return envelope.items as DashboardPostCreationJourneyOptionDto[];
    }

    if ('journeys' in envelope && Array.isArray(envelope.journeys)) {
      return envelope.journeys as DashboardPostCreationJourneyOptionDto[];
    }
  }

  return [];
}

function parseDashboardRecommendationsResponse(
  payload: unknown,
): DashboardProfileRecommendationDto[] {
  const data = unwrapData<unknown>(payload);

  if (Array.isArray(data)) {
    return data.filter(isDashboardRecommendationDto);
  }

  if (
    typeof data === 'object'
    && data !== null
    && 'profiles' in data
    && Array.isArray(data.profiles)
  ) {
    return data.profiles.filter(isDashboardRecommendationDto);
  }

  return [];
}

function parseDashboardJourneyRecommendationsResponse(
  payload: unknown,
): DashboardJourneyRecommendationDto[] {
  const data = unwrapData<unknown>(payload);

  if (Array.isArray(data)) {
    return data.filter(isDashboardJourneyRecommendationDto);
  }

  if (
    typeof data === 'object'
    && data !== null
    && 'journeys' in data
    && Array.isArray(data.journeys)
  ) {
    return data.journeys.filter(isDashboardJourneyRecommendationDto);
  }

  return [];
}

function mapCommentDtoToModel(comment: DashboardCommentDto): DashboardPostComment {
  return {
    content: comment.content,
    createdAt: comment.createdAt,
    id: comment.id,
    user: comment.user
      ? {
          id: comment.user.id,
          profileImage: comment.user.profileImage ?? undefined,
          username: comment.user.username,
        }
      : undefined,
    userId: comment.userId,
  };
}

function parseCommentsResponse(payload: unknown): DashboardPostComment[] {
  const data = unwrapData<unknown>(payload);

  if (Array.isArray(data)) {
    return data.filter(isDashboardCommentDto).map(mapCommentDtoToModel);
  }

  if (typeof data === 'object' && data !== null) {
    if ('comments' in data && Array.isArray(data.comments)) {
      return data.comments.filter(isDashboardCommentDto).map(mapCommentDtoToModel);
    }

    if ('items' in data && Array.isArray(data.items)) {
      return data.items.filter(isDashboardCommentDto).map(mapCommentDtoToModel);
    }
  }

  return [];
}

function isUploadPostMediaResponse(
  payload: unknown,
): payload is DashboardUploadPostMediaResponseDto {
  return (
    typeof payload === 'object'
    && payload !== null
    && 'imageUrl' in payload
    && typeof payload.imageUrl === 'string'
    && 'message' in payload
    && typeof payload.message === 'string'
  );
}

export const dashboardService = {
  async addComment(
    postId: string,
    payload: DashboardAddCommentRequestDto,
  ): Promise<DashboardCommentDto> {
    const response = await httpClient.post<unknown>(
      `/posts/${postId}/comments`,
      JSON.stringify(payload),
    );
    return parseAddCommentResponse(response);
  },

  async addPostMedia(postId: string, payload: DashboardAddPostMediaRequestDto): Promise<void> {
    await httpClient.post<unknown>(`/posts/${postId}/media`, JSON.stringify(payload));
  },

  async createPost(
    payload: DashboardCreatePostRequestDto,
  ): Promise<DashboardCreatePostResponseDto> {
    const response = await httpClient.post<unknown>('/posts', JSON.stringify(payload));
    return unwrapData<DashboardCreatePostResponseDto>(response);
  },

  async getPostsPage(params: DashboardPostsPageParams = {}): Promise<DashboardFeedModel> {
    const dto = await fetchDashboardEnvelope(params);
    return mapDashboardFeed(dto);
  },

  async getFeed(query: DashboardQueryDto = {}): Promise<DashboardFeedModel> {
    return dashboardService.getPostsPage(query);
  },

  async fetchPostComments(postId: string): Promise<DashboardPostComment[]> {
    const response = await httpClient.get<unknown>(`/posts/${postId}/comments`);
    return parseCommentsResponse(response);
  },

  async getRecommendedProfiles(
    query: DashboardRecommendationsQueryDto = {},
  ): Promise<DashboardProfileRecommendation[]> {
    const payload = await httpClient.get<unknown>('/dashboard/recommendations', {
      excludeUserIds: query.excludeUserIds?.join(','),
      limit: query.limit,
    });

    return mapDashboardRecommendations(parseDashboardRecommendationsResponse(payload));
  },

  async getPopularJourneys(
    query: DashboardJourneyRecommendationsQueryDto = {},
  ): Promise<DashboardJourneyRecommendation[]> {
    const payload = await httpClient.get<unknown>('/dashboard/popular-journeys', {
      limit: query.limit,
    });

    return mapDashboardJourneyRecommendations(parseDashboardJourneyRecommendationsResponse(payload));
  },

  async listJourneysForPostCreation(): Promise<DashboardPostCreationJourneyOption[]> {
    const payload = await httpClient.get<unknown>('/journeys/my-journeys');
    const options = parseJourneyCreationOptions(payload);
    return options.map(mapJourneyCreationOption);
  },

  async toggleLike(postId: string, isCurrentlyLiked: boolean): Promise<DashboardLikeResponseDto> {
    if (isCurrentlyLiked) {
      const response = await httpClient.delete<unknown>(`/posts/${postId}/like`);
      return unwrapData<DashboardLikeResponseDto>(response);
    }

    const response = await httpClient.post<unknown>(`/posts/${postId}/like`);
    return unwrapData<DashboardLikeResponseDto>(response);
  },

  async uploadPostMedia(file: File): Promise<DashboardUploadPostMediaResponseDto> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await httpClient.request<unknown>('/posts/media', {
      body: formData,
      method: 'POST',
    });

    if (isUploadPostMediaResponse(response)) {
      return response;
    }

    return unwrapData<DashboardUploadPostMediaResponseDto>(response);
  },
};
