import type { ChatConversationsDto } from '@/modules/chat/dto/chat.dto';
import type { ChatConversation } from '@/modules/chat/types/chat.types';
import { cookies } from 'next/headers';
import { getAppUrl } from '@/lib/app-config';
import { mapChatConversations } from '@/modules/chat/mappers/chat.mapper';
import { unwrapEnvelope } from '@/modules/common/mappers';

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? getAppUrl();
}

type ApiErrorPayload = {
  error: string;
  message: string;
  statusCode: number;
};

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    typeof value === 'object'
    && value !== null
    && 'error' in value
    && 'message' in value
    && 'statusCode' in value
    && typeof value.error === 'string'
    && typeof value.message === 'string'
    && typeof value.statusCode === 'number'
  );
}

export class ChatUnauthorizedError extends Error {
  public constructor() {
    super('CHAT_UNAUTHORIZED');
    this.name = 'ChatUnauthorizedError';
  }
}

export class ChatBootstrapError extends Error {
  public readonly statusCode: number;

  public constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ChatBootstrapError';
    this.statusCode = statusCode;
  }
}

export async function getServerChatConversations(): Promise<ChatConversation[]> {
  const cookieStore = await cookies();
  const response = await fetch(`${getBaseUrl()}/api/chat/conversations`, {
    cache: 'no-store',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      cookie: cookieStore.toString(),
    },
  });

  const payload: unknown = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new ChatUnauthorizedError();
  }

  if (!response.ok) {
    if (isApiErrorPayload(payload)) {
      throw new ChatBootstrapError(payload.message, payload.statusCode);
    }

    throw new ChatBootstrapError(
      `Failed to load chat conversations (${response.status})`,
      response.status,
    );
  }

  const dto = unwrapEnvelope<ChatConversationsDto>(payload).data;
  return mapChatConversations(dto);
}
