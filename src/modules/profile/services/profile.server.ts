import type { UserProfileResponseDto } from '@/modules/profile/dto/profile.dto';
import type { UserProfile } from '@/modules/profile/types/profile.types';
import { cookies } from 'next/headers';
import { unwrapEnvelope } from '@/modules/common/mappers';
import { mapUserProfile } from '@/modules/profile/mappers/profile.mapper';

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

async function fetchServerProfile(path: string): Promise<UserProfile> {
  const cookieStore = await cookies();
  const response = await fetch(`${getBaseUrl()}${path}`, {
    cache: 'no-store',
    credentials: 'include',
    headers: {
      cookie: cookieStore.toString(),
    },
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to load profile');
  }

  const payload: unknown = await response.json().catch(() => null);
  const dto = unwrapEnvelope<UserProfileResponseDto>(payload).data;
  return mapUserProfile(dto);
}

export async function getServerCurrentProfile(): Promise<UserProfile> {
  return fetchServerProfile('/api/user/me');
}

export async function getServerProfileById(userId: string): Promise<UserProfile> {
  return fetchServerProfile(`/api/user/${userId}`);
}
