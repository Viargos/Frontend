import type { UserSearchResponseDto } from '@/modules/search/dto/search.dto';
import type { UserSearchResult } from '@/modules/search/types/search.types';
import { httpClient } from '@/lib/api/http-client';
import { mapUserSearchResults } from '@/modules/search/mappers/search.mapper';

type EnvelopeLike<TData> = {
  data: TData;
};

function hasEnvelopeData<TData>(payload: unknown): payload is EnvelopeLike<TData> {
  return typeof payload === 'object' && payload !== null && 'data' in payload;
}

function isUserSearchResponseDto(payload: unknown): payload is UserSearchResponseDto {
  if (!payload || typeof payload !== 'object' || !('users' in payload)) {
    return false;
  }

  if (!Array.isArray(payload.users)) {
    return false;
  }

  return payload.users.every(user => (
    user
    && typeof user === 'object'
    && 'id' in user
    && 'username' in user
    && typeof user.id === 'string'
    && typeof user.username === 'string'
  ));
}

function toUserSearchResponse(payload: unknown): UserSearchResponseDto {
  if (isUserSearchResponseDto(payload)) {
    return payload;
  }

  if (hasEnvelopeData<unknown>(payload) && isUserSearchResponseDto(payload.data)) {
    return payload.data;
  }

  throw new Error('Invalid user search response payload');
}

export const searchService = {
  async searchUsers(query: string, options?: { limit?: number; signal?: AbortSignal }): Promise<UserSearchResult[]> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return [];
    }

    const payload = await httpClient.request<unknown>('/chat/users/search', {
      method: 'GET',
      query: {
        limit: options?.limit ?? 12,
        q: normalizedQuery,
      },
      signal: options?.signal,
    });

    const response = toUserSearchResponse(payload);
    return mapUserSearchResults(response.users ?? []);
  },
};
