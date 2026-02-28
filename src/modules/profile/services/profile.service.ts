import type { UserProfileResponseDto } from '@/modules/profile/dto/profile.dto';
import type { UserProfile } from '@/modules/profile/types/profile.types';
import { httpClient } from '@/lib/api/http-client';
import { unwrapEnvelope } from '@/modules/common/mappers';
import { mapUserProfile } from '@/modules/profile/mappers/profile.mapper';

async function requestProfile(path: string): Promise<UserProfileResponseDto> {
  const payload = await httpClient.get<unknown>(path);
  return unwrapEnvelope<UserProfileResponseDto>(payload).data;
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
};
