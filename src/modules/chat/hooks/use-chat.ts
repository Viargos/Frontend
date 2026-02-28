'use client';

import type { InfiniteData } from '@tanstack/react-query';
import type { ChatMessageDto } from '@/modules/chat/dto/chat.dto';
import type { ChatMessagesPage } from '@/modules/chat/services/chat.service';
import type { ChatConversation, ChatMessage, ChatUser } from '@/modules/chat/types/chat.types';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '@/lib/api/api-error';
import { appConfig } from '@/lib/app-config';
import { CHAT_MESSAGE_LIMIT } from '@/modules/chat/constants/chat.constants';
import { connectSocket, disconnectSocket, joinConversation, sendMessage as sendSocketMessage, subscribeToDelivery, subscribeToMessages, subscribeToSocketErrors } from '@/modules/chat/infra/socket-adapter';
import { mapChatMessage } from '@/modules/chat/mappers/chat.mapper';
import { chatQueryKeys } from '@/modules/chat/query-keys';
import { chatService } from '@/modules/chat/services/chat.service';
import { sendMessageSchema } from '@/modules/chat/validations/chat.validation';

function sortByDate(messages: ChatMessage[]): ChatMessage[] {
  return [...messages]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

function getConversationIdForParticipants(userIdA: string, userIdB: string): string {
  return userIdA < userIdB ? `${userIdA}__${userIdB}` : `${userIdB}__${userIdA}`;
}

function createTempMessageId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `temp-${crypto.randomUUID()}`;
  }

  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function findConversationByUserId(conversations: ChatConversation[], userId: string): ChatConversation | undefined {
  return conversations.find(item => item.user.id === userId);
}

function isUnauthorizedError(value: unknown): boolean {
  return value instanceof ApiError
    && (value.statusCode === 401 || value.code === 'UNAUTHORIZED');
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function readCookieToken(cookieName: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const matched = document.cookie
    .split(';')
    .map(item => item.trim())
    .find(item => item.startsWith(`${cookieName}=`));

  if (!matched) {
    return undefined;
  }

  const value = matched.slice(cookieName.length + 1);
  return value ? decodeURIComponent(value) : undefined;
}

function readClientAccessToken(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const cookieToken = readCookieToken('viargos_access_token');
  if (cookieToken) {
    return cookieToken;
  }

  const localStorageToken = window.localStorage.getItem('viargos_access_token') ?? window.localStorage.getItem('accessToken');
  if (localStorageToken) {
    return localStorageToken;
  }

  const sessionStorageToken = window.sessionStorage.getItem('viargos_access_token') ?? window.sessionStorage.getItem('accessToken');
  return sessionStorageToken ?? undefined;
}

type MessagePageParam = 'bootstrap' | {
  limit: number;
  offset: number;
};

type ChatMessageQueryPage = ChatMessagesPage & {
  pageLimit: number;
  pageOffset: number;
};

function flattenUniqueMessages(pages: ChatMessageQueryPage[]): ChatMessage[] {
  const map = new Map<string, ChatMessage>();
  for (const page of pages) {
    for (const message of page.messages) {
      map.set(message.id, message);
    }
  }
  return sortByDate(Array.from(map.values()));
}

function toConversationMessage(previous: ChatMessage[], message: ChatMessage): ChatMessage[] {
  const index = previous.findIndex(item => item.id === message.id);
  if (index === -1) {
    return [...previous, message];
  }

  const copy = [...previous];
  copy[index] = message;
  return copy;
}

function replaceMessage(previous: ChatMessage[], oldMessageId: string, nextMessage: ChatMessage): ChatMessage[] {
  let replaced = false;

  const updated = previous.map((item) => {
    if (item.id !== oldMessageId) {
      return item;
    }

    replaced = true;
    return nextMessage;
  });

  if (!replaced) {
    return [...updated, nextMessage];
  }

  return updated;
}

function updateMessageStatus(previous: ChatMessage[], messageId: string, status: ChatMessage['status']): ChatMessage[] {
  return previous.map((item) => {
    if (item.id !== messageId) {
      return item;
    }

    return {
      ...item,
      status,
    };
  });
}

function updateConversationWithMessage(
  previous: ChatConversation[],
  message: ChatMessage,
  options: {
    currentUserId: string;
    incrementUnread: boolean;
  },
): ChatConversation[] {
  const conversationId = getConversationIdForParticipants(message.senderId, message.receiverId);
  const existingConversation = previous.find(item => item.id === conversationId);
  const unreadCount = existingConversation
    ? Math.max(0, existingConversation.unreadCount + (options.incrementUnread ? 1 : 0))
    : (options.incrementUnread ? 1 : 0);

  if (existingConversation) {
    return previous.map((conversation) => {
      if (conversation.id !== conversationId) {
        return conversation;
      }

      return {
        ...conversation,
        lastMessage: message,
        unreadCount,
        updatedAt: message.createdAt,
      };
    });
  }

  const conversationUser = message.senderId === options.currentUserId
    ? message.receiver
    : message.sender;

  if (!conversationUser) {
    return previous;
  }

  return [{
    id: conversationId,
    lastMessage: message,
    unreadCount,
    updatedAt: message.createdAt,
    user: conversationUser,
  }, ...previous];
}

function createInitialMessagePage(): ChatMessageQueryPage {
  return {
    messages: [],
    pageLimit: CHAT_MESSAGE_LIMIT,
    pageOffset: 0,
    pagination: {
      hasMore: false,
      limit: CHAT_MESSAGE_LIMIT,
      offset: 0,
      total: 0,
    },
  };
}

function updateMessagePages(
  previous: InfiniteData<ChatMessageQueryPage> | undefined,
  updater: (messages: ChatMessage[]) => ChatMessage[],
): InfiniteData<ChatMessageQueryPage> {
  const base: InfiniteData<ChatMessageQueryPage> = previous && previous.pages.length > 0
    ? previous
    : {
        pageParams: ['bootstrap'],
        pages: [createInitialMessagePage()],
      };

  const [latestPage, ...olderPages] = base.pages;
  if (!latestPage) {
    return base;
  }

  const nextMessages = sortByDate(updater(latestPage.messages));
  const totalDelta = nextMessages.length - latestPage.messages.length;

  const updatedLatest: ChatMessageQueryPage = {
    ...latestPage,
    messages: nextMessages,
    pagination: {
      ...latestPage.pagination,
      total: Math.max(0, latestPage.pagination.total + totalDelta),
    },
  };

  return {
    ...base,
    pages: [updatedLatest, ...olderPages],
  };
}

export function useChat(
  initialConversations: ChatConversation[],
  options?: {
    autoSelectFirstConversation?: boolean;
  },
) {
  const autoSelectFirstConversation = options?.autoSelectFirstConversation ?? true;
  const queryClient = useQueryClient();
  const markConversationReadRef = useRef(new Set<string>());
  const selectedConversationIdRef = useRef<string | null>(null);
  const [explicitSelectedConversationId, setExplicitSelectedConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const conversationsQuery = useQuery<ChatConversation[]>({
    initialData: initialConversations,
    queryFn: chatService.getConversations,
    queryKey: chatQueryKeys.list(),
    retry: appConfig.reactQuery.retry,
    staleTime: appConfig.reactQuery.staleTimeMs,
  });

  const currentUserQuery = useQuery<ChatUser>({
    queryFn: chatService.getCurrentUser,
    queryKey: chatQueryKeys.currentUser(),
    retry: appConfig.reactQuery.retry,
    staleTime: appConfig.reactQuery.staleTimeMs,
  });

  const conversations = useMemo(() => conversationsQuery.data ?? [], [conversationsQuery.data]);
  const selectedConversationId = useMemo(() => {
    if (explicitSelectedConversationId) {
      const selectedExists = conversations.some(item => item.id === explicitSelectedConversationId);
      if (selectedExists) {
        return explicitSelectedConversationId;
      }
    }

    if (autoSelectFirstConversation) {
      return conversations[0]?.id ?? null;
    }

    return null;
  }, [autoSelectFirstConversation, conversations, explicitSelectedConversationId]);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const selectedConversation = useMemo(
    () => conversations.find(item => item.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  const messagesQuery = useInfiniteQuery<ChatMessageQueryPage, Error, InfiniteData<ChatMessageQueryPage>, ReturnType<typeof chatQueryKeys.messages>, MessagePageParam>({
    enabled: Boolean(selectedConversationId),
    initialPageParam: 'bootstrap',
    queryFn: async ({ pageParam }) => {
      const conversationId = selectedConversationId;
      if (!conversationId) {
        throw new Error('Conversation is required to fetch messages.');
      }

      if (pageParam === 'bootstrap') {
        const bootstrapPage = await chatService.getMessagesPage(conversationId, {
          limit: CHAT_MESSAGE_LIMIT,
          offset: 0,
        });

        if (bootstrapPage.pagination.total <= CHAT_MESSAGE_LIMIT) {
          return {
            ...bootstrapPage,
            pageLimit: CHAT_MESSAGE_LIMIT,
            pageOffset: 0,
          };
        }

        const latestOffset = Math.max(bootstrapPage.pagination.total - CHAT_MESSAGE_LIMIT, 0);
        const latestPage = await chatService.getMessagesPage(conversationId, {
          limit: CHAT_MESSAGE_LIMIT,
          offset: latestOffset,
        });

        return {
          ...latestPage,
          pageLimit: CHAT_MESSAGE_LIMIT,
          pageOffset: latestOffset,
        };
      }

      const page = await chatService.getMessagesPage(conversationId, {
        limit: pageParam.limit,
        offset: pageParam.offset,
      });

      return {
        ...page,
        pageLimit: pageParam.limit,
        pageOffset: pageParam.offset,
      };
    },
    getNextPageParam: (_lastPage, allPages) => {
      const oldestOffset = Math.min(...allPages.map(page => page.pageOffset));
      if (oldestOffset <= 0) {
        return undefined;
      }

      const nextLimit = Math.min(CHAT_MESSAGE_LIMIT, oldestOffset);
      return {
        limit: nextLimit,
        offset: oldestOffset - nextLimit,
      };
    },
    queryKey: chatQueryKeys.messages(selectedConversationId ?? ''),
    retry: appConfig.reactQuery.retry,
    staleTime: appConfig.reactQuery.staleTimeMs,
  });

  useEffect(() => {
    if (!selectedConversation?.id) {
      return;
    }

    if (markConversationReadRef.current.has(selectedConversation.id)) {
      return;
    }

    markConversationReadRef.current.add(selectedConversation.id);

    void chatService.markConversationAsRead(selectedConversation.id).catch((caught) => {
      markConversationReadRef.current.delete(selectedConversation.id);
      setError(toErrorMessage(caught, 'Failed to update read status'));
    });
  }, [selectedConversation?.id]);

  useEffect(() => {
    const currentUser = currentUserQuery.data;
    if (!currentUser) {
      return;
    }

    let unmounted = false;
    let unsubscribeMessages = () => {};
    let unsubscribeDelivery = () => {};
    let unsubscribeErrors = () => {};

    const connect = async () => {
      try {
        await connectSocket({
          token: readClientAccessToken(),
        });

        if (unmounted) {
          return;
        }

        const activeConversationId = selectedConversationIdRef.current;
        if (activeConversationId) {
          joinConversation(activeConversationId);
        }

        unsubscribeMessages = subscribeToMessages((payload: ChatMessageDto) => {
          const incomingMessage = mapChatMessage(payload);
          const conversationId = getConversationIdForParticipants(incomingMessage.senderId, incomingMessage.receiverId);
          const isActiveConversation = selectedConversationIdRef.current === conversationId;

          queryClient.setQueryData<InfiniteData<ChatMessageQueryPage>>(chatQueryKeys.messages(conversationId), (previous) => {
            if (!previous) {
              return previous;
            }

            return updateMessagePages(previous, messages => toConversationMessage(messages, incomingMessage));
          });

          queryClient.setQueryData<ChatConversation[]>(chatQueryKeys.list(), (previous = []) => {
            return updateConversationWithMessage(previous, incomingMessage, {
              currentUserId: currentUser.id,
              incrementUnread: !isActiveConversation,
            });
          });
        });

        unsubscribeDelivery = subscribeToDelivery((payload: ChatMessageDto) => {
          const deliveredMessage = mapChatMessage(payload);
          const conversationId = getConversationIdForParticipants(deliveredMessage.senderId, deliveredMessage.receiverId);

          queryClient.setQueryData<InfiniteData<ChatMessageQueryPage>>(chatQueryKeys.messages(conversationId), (previous) => {
            return updateMessagePages(previous, (messages) => {
              if (deliveredMessage.tempId) {
                const tempMatch = messages.find(item => item.id === deliveredMessage.tempId);
                if (tempMatch) {
                  return replaceMessage(messages, tempMatch.id, deliveredMessage);
                }
              }

              const pendingCandidate = messages.find(item => (
                item.status === 'pending'
                && item.senderId === deliveredMessage.senderId
                && item.receiverId === deliveredMessage.receiverId
                && item.content === deliveredMessage.content
              ));

              if (pendingCandidate) {
                return replaceMessage(messages, pendingCandidate.id, deliveredMessage);
              }

              return toConversationMessage(messages, deliveredMessage);
            });
          });

          queryClient.setQueryData<ChatConversation[]>(chatQueryKeys.list(), (previous = []) => {
            return updateConversationWithMessage(previous, deliveredMessage, {
              currentUserId: currentUser.id,
              incrementUnread: false,
            });
          });
        });

        unsubscribeErrors = subscribeToSocketErrors((message) => {
          setError(message);
        });
      } catch (caught) {
        setError(toErrorMessage(caught, 'Realtime chat connection failed'));
      }
    };

    void connect();

    return () => {
      unmounted = true;
      unsubscribeMessages();
      unsubscribeDelivery();
      unsubscribeErrors();
      disconnectSocket();
    };
  }, [currentUserQuery.data, queryClient]);

  useEffect(() => {
    if (!selectedConversation?.id) {
      return;
    }

    joinConversation(selectedConversation.id);
  }, [selectedConversation?.id]);

  const sendOptimisticMessageOverSocket = useCallback((params: {
    conversationId: string;
    receiverId: string;
    tempMessageId: string;
    text: string;
  }) => {
    void sendSocketMessage({
      conversationId: params.conversationId,
      content: params.text,
      receiverId: params.receiverId,
      tempId: params.tempMessageId,
    }).then((payload) => {
      const deliveredMessage = mapChatMessage(payload);

      queryClient.setQueryData<InfiniteData<ChatMessageQueryPage>>(chatQueryKeys.messages(params.conversationId), (previous) => {
        return updateMessagePages(previous, messages => replaceMessage(messages, params.tempMessageId, deliveredMessage));
      });

      queryClient.setQueryData<ChatConversation[]>(chatQueryKeys.list(), (previous = []) => {
        const currentUser = currentUserQuery.data;
        if (!currentUser) {
          return previous;
        }

        return updateConversationWithMessage(previous, deliveredMessage, {
          currentUserId: currentUser.id,
          incrementUnread: false,
        });
      });

      setError(null);
    }).catch((caught) => {
      queryClient.setQueryData<InfiniteData<ChatMessageQueryPage>>(chatQueryKeys.messages(params.conversationId), (previous) => {
        return updateMessagePages(previous, messages => updateMessageStatus(messages, params.tempMessageId, 'failed'));
      });
      setError(toErrorMessage(caught, 'Failed to send message'));
    });
  }, [currentUserQuery.data, queryClient]);

  const createConversationMutation = useMutation({
    mutationFn: (userId: string) => chatService.createConversation({ userId }),
    onSuccess: (created) => {
      queryClient.setQueryData<ChatConversation[]>(chatQueryKeys.list(), (previous = []) => {
        if (previous.some(item => item.id === created.id)) {
          return previous;
        }
        return [created, ...previous];
      });
      setExplicitSelectedConversationId(created.id);
      setError(null);
    },
    onError: (caught) => {
      setError(toErrorMessage(caught, 'Failed to create conversation'));
    },
  });

  const refreshConversations = useCallback(async () => {
    const [conversationsResult, userResult] = await Promise.all([
      conversationsQuery.refetch(),
      currentUserQuery.refetch(),
    ]);

    if (conversationsResult.error) {
      setError(conversationsResult.error.message);
      return;
    }

    if (userResult.error) {
      setError(userResult.error.message);
      return;
    }

    setError(null);
  }, [conversationsQuery, currentUserQuery]);

  const selectConversation = useCallback((conversationId: string) => {
    setExplicitSelectedConversationId(conversationId);
    setError(null);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const parsed = sendMessageSchema.safeParse({ content });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Message is invalid');
      return;
    }

    if (!selectedConversation) {
      setError('Select a conversation before sending a message');
      return;
    }

    const currentUser = currentUserQuery.data;
    if (!currentUser) {
      setError('Current user is not available');
      return;
    }

    const tempMessageId = createTempMessageId();
    const optimisticMessage: ChatMessage = {
      content: parsed.data.content,
      createdAt: new Date().toISOString(),
      id: tempMessageId,
      isRead: false,
      receiver: selectedConversation.user,
      receiverId: selectedConversation.user.id,
      sender: currentUser,
      senderId: currentUser.id,
      status: 'pending',
      tempId: tempMessageId,
    };

    queryClient.setQueryData<InfiniteData<ChatMessageQueryPage>>(chatQueryKeys.messages(selectedConversation.id), (previous) => {
      return updateMessagePages(previous, messages => toConversationMessage(messages, optimisticMessage));
    });

    queryClient.setQueryData<ChatConversation[]>(chatQueryKeys.list(), (previous = []) => {
      return updateConversationWithMessage(previous, optimisticMessage, {
        currentUserId: currentUser.id,
        incrementUnread: false,
      });
    });

    sendOptimisticMessageOverSocket({
      conversationId: selectedConversation.id,
      receiverId: selectedConversation.user.id,
      tempMessageId,
      text: parsed.data.content,
    });

    setError(null);
  }, [currentUserQuery.data, queryClient, selectedConversation, sendOptimisticMessageOverSocket]);

  const retryMessage = useCallback((messageId: string) => {
    if (!selectedConversation) {
      return;
    }

    const failedMessage = flattenUniqueMessages(messagesQuery.data?.pages ?? [])
      .find(item => item.id === messageId && item.status === 'failed');

    if (!failedMessage) {
      return;
    }

    queryClient.setQueryData<InfiniteData<ChatMessageQueryPage>>(chatQueryKeys.messages(selectedConversation.id), (previous) => {
      return updateMessagePages(previous, messages => updateMessageStatus(messages, messageId, 'pending'));
    });

    sendOptimisticMessageOverSocket({
      conversationId: selectedConversation.id,
      receiverId: failedMessage.receiverId,
      tempMessageId: messageId,
      text: failedMessage.content,
    });
  }, [messagesQuery.data?.pages, queryClient, selectedConversation, sendOptimisticMessageOverSocket]);

  const startConversation = useCallback(async (userId: string) => {
    const existing = findConversationByUserId(conversations, userId);
    if (existing) {
      setExplicitSelectedConversationId(existing.id);
      setError(null);
      return;
    }

    await createConversationMutation.mutateAsync(userId);
  }, [conversations, createConversationMutation]);

  const queryError = conversationsQuery.error ?? currentUserQuery.error ?? messagesQuery.error;
  const flattenedMessages = useMemo(
    () => flattenUniqueMessages(messagesQuery.data?.pages ?? []),
    [messagesQuery.data?.pages],
  );

  const hasOlderMessages = Boolean(messagesQuery.hasNextPage);
  const loadOlderMessages = useCallback(async () => {
    if (!messagesQuery.hasNextPage || messagesQuery.isFetchingNextPage) {
      return;
    }

    await messagesQuery.fetchNextPage();
  }, [messagesQuery]);

  const isUnauthorized = isUnauthorizedError(queryError);

  return {
    conversations,
    currentUser: currentUserQuery.data ?? null,
    error: error ?? (queryError instanceof Error ? queryError.message : null),
    hasOlderMessages,
    isFetchingOlderMessages: messagesQuery.isFetchingNextPage,
    isLoadingConversations: conversationsQuery.isLoading || currentUserQuery.isLoading,
    isLoadingMessages: messagesQuery.isLoading || (messagesQuery.isFetching && !messagesQuery.isFetchingNextPage),
    isUnauthorized,
    loadOlderMessages,
    messages: flattenedMessages,
    refreshConversations,
    retryMessage,
    selectedConversation,
    selectConversation,
    sendMessage,
    startConversation,
  };
}
