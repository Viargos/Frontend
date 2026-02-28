import type {
  ChatConversationsDto,
  ChatCreateConversationRequestDto,
  ChatMeDto,
  ChatMessagesDto,
  ChatSendMessageDto,
  ChatSendMessageRequestDto,
} from '@/modules/chat/dto/chat.dto';
import type { ChatConversation, ChatMessage, ChatMessageQuery, ChatUser } from '@/modules/chat/types/chat.types';
import { httpClient } from '@/lib/api/http-client';
import { CHAT_MESSAGE_LIMIT } from '@/modules/chat/constants/chat.constants';
import { mapChatConversations, mapChatMessages, mapChatUser } from '@/modules/chat/mappers/chat.mapper';
import { unwrapEnvelope } from '@/modules/common/mappers';

type ChatEnvelopeLike<T> = {
  data: T;
};

function hasEnvelopeData<T>(payload: unknown): payload is ChatEnvelopeLike<T> {
  return typeof payload === 'object' && payload !== null && 'data' in payload;
}

function toEnvelope<T>(payload: unknown): ChatEnvelopeLike<T> {
  if (hasEnvelopeData<T>(payload)) {
    return unwrapEnvelope<T>(payload);
  }

  return unwrapEnvelope<T>({ data: payload });
}

async function readData<T>(path: string, options?: { body?: string; method?: 'GET' | 'POST' | 'PUT' }): Promise<T> {
  const payload = await httpClient.request<unknown>(path, {
    body: options?.body ?? null,
    method: options?.method ?? 'GET',
  });
  return toEnvelope<T>(payload).data;
}

function createQueryString(query?: ChatMessageQuery): string {
  const params = new URLSearchParams();

  params.set('limit', String(query?.limit ?? CHAT_MESSAGE_LIMIT));
  params.set('offset', String(query?.offset ?? 0));

  const encoded = params.toString();
  return encoded ? `?${encoded}` : '';
}

export type ChatMessagesPage = {
  messages: ChatMessage[];
  pagination: {
    hasMore: boolean;
    limit: number;
    offset: number;
    total: number;
  };
};

export const chatService = {
  async createConversation(input: ChatCreateConversationRequestDto): Promise<ChatConversation> {
    const dto = await readData<{ conversation: ChatConversationsDto['conversations'][number] }>('/chat/conversations', {
      body: JSON.stringify(input),
      method: 'POST',
    });
    return mapChatConversations({ conversations: [dto.conversation] })[0]!;
  },

  async getConversations(): Promise<ChatConversation[]> {
    const dto = await readData<ChatConversationsDto>('/chat/conversations');
    return mapChatConversations(dto);
  },

  async getCurrentUser(): Promise<ChatUser> {
    const dto = await readData<ChatMeDto>('/chat/me');
    return mapChatUser(dto.user);
  },

  async getMessages(conversationId: string, query?: ChatMessageQuery): Promise<ChatMessage[]> {
    const page = await this.getMessagesPage(conversationId, query);
    return page.messages;
  },

  async getMessagesPage(conversationId: string, query?: ChatMessageQuery): Promise<ChatMessagesPage> {
    const dto = await readData<ChatMessagesDto>(`/chat/conversations/${conversationId}/messages${createQueryString(query)}`);
    const messages = mapChatMessages(dto);
    const pagination = dto.pagination ?? {
      hasMore: messages.length >= (query?.limit ?? CHAT_MESSAGE_LIMIT),
      limit: query?.limit ?? CHAT_MESSAGE_LIMIT,
      offset: query?.offset ?? 0,
      total: messages.length,
    };

    return {
      messages,
      pagination: {
        hasMore: pagination.hasMore,
        limit: pagination.limit,
        offset: pagination.offset,
        total: pagination.total,
      },
    };
  },

  async markConversationAsRead(conversationId: string): Promise<void> {
    await readData<{ success?: boolean }>(`/chat/conversations/${conversationId}/read`, {
      method: 'PUT',
    });
  },

  async sendMessage(input: ChatSendMessageRequestDto): Promise<ChatMessage> {
    const dto = await readData<ChatSendMessageDto>('/chat/messages', {
      body: JSON.stringify(input),
      method: 'POST',
    });
    return mapChatMessages({ messages: [dto.message] })[0]!;
  },
};
