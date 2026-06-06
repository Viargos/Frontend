import type { UserProfileResponseDto } from '@/modules/profile/dto/profile.dto';
import type {
  PostDetail,
  PostMediaItem,
  ProfilePostComment,
  ProfilePostCommentUser,
  UserProfile,
} from '@/modules/profile/types/profile.types';
import { httpClient } from '@/lib/api/http-client';
import { unwrapEnvelope } from '@/modules/common/mappers';
import { mapUserProfile } from '@/modules/profile/mappers/profile.mapper';

async function requestProfile(path: string): Promise<UserProfileResponseDto> {
  const payload = await httpClient.get<unknown>(path);
  return unwrapEnvelope<UserProfileResponseDto>(payload).data;
}

function unwrapData<TData>(payload: unknown): TData {
  return unwrapEnvelope<TData>(payload).data;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCommentUser(value: unknown): value is ProfilePostCommentUser {
  return (
    isRecord(value)
    && typeof value.id === 'string'
    && typeof value.username === 'string'
    && (!('profileImage' in value) || value.profileImage === null || typeof value.profileImage === 'string')
  );
}

function isCommentDto(value: unknown): value is Record<string, unknown> {
  return (
    isRecord(value)
    && typeof value.id === 'string'
    && typeof value.content === 'string'
    && typeof value.createdAt === 'string'
    && (!('userId' in value) || typeof value.userId === 'string')
  );
}

function mapCommentDtoToModel(comment: Record<string, unknown>): ProfilePostComment {
  const commentUser = comment.user;

  return {
    content: typeof comment.content === 'string' ? comment.content : '',
    createdAt: typeof comment.createdAt === 'string' ? comment.createdAt : '',
    id: typeof comment.id === 'string' ? comment.id : '',
    user: isCommentUser(commentUser)
      ? {
          id: commentUser.id,
          profileImage: commentUser.profileImage ?? undefined,
          username: commentUser.username,
        }
      : undefined,
    userId: typeof comment.userId === 'string' ? comment.userId : undefined,
  };
}

function parseCommentsResponse(payload: unknown): ProfilePostComment[] {
  const data = unwrapData<unknown>(payload);

  if (Array.isArray(data)) {
    return data.filter(isCommentDto).map(mapCommentDtoToModel);
  }

  if (isRecord(data)) {
    if (Array.isArray(data.comments)) {
      return data.comments.filter(isCommentDto).map(mapCommentDtoToModel);
    }

    if (Array.isArray(data.items)) {
      return data.items.filter(isCommentDto).map(mapCommentDtoToModel);
    }
  }

  return [];
}

export const profileService = {
  async getCurrentUserProfile(): Promise<UserProfile> {
    const dto = await requestProfile('/user/me');
    return mapUserProfile(dto);
  },

  async getUserProfileById(userId: string): Promise<UserProfile> {
    const dto = await requestProfile(`/user/${userId}`);
    return mapUserProfile(dto);
  },

  async followUser(userId: string): Promise<void> {
    await httpClient.post<unknown>('/user/relationships/follow', JSON.stringify({ userId }));
  },

  async unfollowUser(userId: string): Promise<void> {
    await httpClient.delete<unknown>(`/user/relationships/unfollow/${userId}`);
  },

  async getPostById(postId: string): Promise<PostDetail> {
    const payload = await httpClient.get<unknown>(`/posts/${postId}`);
    const raw = unwrapData<Record<string, unknown>>(payload);

    const media: PostMediaItem[] = Array.isArray(raw.media)
      ? (raw.media as Record<string, unknown>[]).map(m => ({
          id: typeof m.id === 'string' ? m.id : '',
          order: typeof m.order === 'number' ? m.order : 0,
          type: typeof m.type === 'string' ? m.type : 'image',
          url: typeof m.url === 'string' ? m.url : '',
        })).filter(m => m.id && m.url)
      : [];

    return {
      commentCount: typeof raw.commentCount === 'number' ? raw.commentCount : 0,
      createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
      description: typeof raw.description === 'string' ? raw.description : '',
      id: typeof raw.id === 'string' ? raw.id : postId,
      journeyId: typeof raw.journeyId === 'string' ? raw.journeyId : null,
      likeCount: typeof raw.likeCount === 'number' ? raw.likeCount : 0,
      location: typeof raw.location === 'string' ? raw.location : null,
      media,
    };
  },

  async updatePost(
    postId: string,
    data: { description?: string; journeyId?: string | null; location?: string | null },
  ): Promise<void> {
    await httpClient.patch<unknown>(`/posts/${postId}`, JSON.stringify(data));
  },

  async deletePost(postId: string): Promise<void> {
    await httpClient.delete<unknown>(`/posts/${postId}`);
  },

  async fetchPostComments(postId: string): Promise<ProfilePostComment[]> {
    const response = await httpClient.get<unknown>(`/posts/${postId}/comments`);
    return parseCommentsResponse(response);
  },

  async uploadPostMedia(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await httpClient.request<unknown>('/posts/media', {
      body: formData,
      method: 'POST',
    });
    const raw = unwrapEnvelope<{ imageUrl: string }>(response).data;
    return raw.imageUrl;
  },

  async addPostMedia(postId: string, imageUrl: string): Promise<void> {
    await httpClient.post<unknown>(
      `/posts/${postId}/media`,
      JSON.stringify({ type: 'image', url: imageUrl }),
    );
  },

  async removePostMedia(postId: string, mediaUrl: string): Promise<void> {
    await httpClient.request<unknown>(
      `/posts/${postId}/media?url=${encodeURIComponent(mediaUrl)}`,
      { method: 'DELETE' },
    );
  },

  async updateProfile(data: {
    username?: string;
    email?: string;
  }): Promise<void> {
    await httpClient.patch<unknown>('/user/profile', JSON.stringify(data));
  },

  async uploadProfileImage(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('image', file);
    await httpClient.request<unknown>('/user/profile-image', {
      body: formData,
      method: 'POST',
    });
  },

  async deleteProfileImage(): Promise<void> {
    await httpClient.delete<unknown>('/user/profile-image');
  },

  async uploadBannerImage(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('image', file);
    await httpClient.request<unknown>('/user/banner-image', {
      body: formData,
      method: 'POST',
    });
  },

  async deleteBannerImage(): Promise<void> {
    await httpClient.delete<unknown>('/user/banner-image');
  },
};
