import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getAppUrl } from '@/lib/app-config';

type SearchUser = {
  id: string;
  username: string;
};

type SearchUsersPayload = {
  users: SearchUser[];
};

function hasSearchUsersPayload(payload: unknown): payload is SearchUsersPayload {
  if (!payload || typeof payload !== 'object' || !('users' in payload)) {
    return false;
  }

  const users = payload.users;
  if (!Array.isArray(users)) {
    return false;
  }

  return users.every(user => (
    user
    && typeof user === 'object'
    && 'id' in user
    && 'username' in user
    && typeof user.id === 'string'
    && typeof user.username === 'string'
  ));
}

function extractUsers(payload: unknown): SearchUser[] {
  if (hasSearchUsersPayload(payload)) {
    return payload.users;
  }

  if (
    payload
    && typeof payload === 'object'
    && 'data' in payload
    && hasSearchUsersPayload(payload.data)
  ) {
    return payload.data.users;
  }

  return [];
}

export default async function ProfileByUsernamePage(props: { params: Promise<{ username: string }> }) {
  const { username } = await props.params;
  const normalizedUsername = username.trim().toLowerCase();

  if (!normalizedUsername) {
    notFound();
  }

  const cookieStore = await cookies();
  const url = new URL('/api/chat/users/search', getAppUrl());
  url.searchParams.set('q', username);
  url.searchParams.set('limit', '12');

  const response = await fetch(url.toString(), {
    cache: 'no-store',
    credentials: 'include',
    headers: {
      cookie: cookieStore.toString(),
    },
    method: 'GET',
  });

  if (!response.ok) {
    notFound();
  }

  const payload = await response.json().catch(() => null);
  const users = extractUsers(payload);
  const selectedUser = users.find(user => user.username.toLowerCase() === normalizedUsername);

  if (!selectedUser) {
    notFound();
  }

  redirect(`/user/${selectedUser.id}`);
}
