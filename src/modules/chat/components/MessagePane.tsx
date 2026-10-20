'use client';

import type { ChatConversation, ChatMessage, ChatUser } from '@/modules/chat/types/chat.types';
import Image from 'next/image';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { ChatHeader } from '@/modules/chat/components/ChatHeader';
import { MessageBubble } from '@/modules/chat/components/MessageBubble';
import { MessageComposer } from '@/modules/chat/components/MessageComposer';
import { CHAT_COPY } from '@/modules/chat/constants/chat-copy';
import { ChatBubbleIcon } from '@/modules/common/icons';

type MessagePaneProps = {
  isChatWindowOpen?: boolean;
  currentUser: ChatUser | null;
  conversation: ChatConversation | null;
  hasOlderMessages: boolean;
  isFetchingOlderMessages: boolean;
  isLoading: boolean;
  loadOlderMessages: () => Promise<void>;
  messages: ChatMessage[];
  onBackToChatList?: () => void;
  onNewChat?: () => void;
  onRetryMessage: (messageId: string) => void;
  onSendMessage: (content: string) => Promise<void>;
  showBackButton?: boolean;
};

type MessageSkeletonProps = {
  id: string;
  isOwn: boolean;
  width1: number;
  width2: number;
};

function MessageSkeleton(props: MessageSkeletonProps) {
  const { isOwn, width1, width2 } = props;
  const directionClassName = isOwn ? 'justify-end' : 'justify-start';
  const rowClassName = isOwn ? 'flex-row-reverse space-x-reverse' : '';
  const bubbleClassName = isOwn ? 'bg-[var(--surface-2)]' : 'bg-[var(--surface-1)]';
  const lineClassName = isOwn ? 'bg-[var(--surface-3)]' : 'bg-[var(--surface-2)]';
  const timeClassName = isOwn ? 'bg-[var(--surface-2)]' : 'bg-[var(--surface-2)]';

  return (
    <div className={`flex ${directionClassName}`}>
      <div className={`flex max-w-xs items-end space-x-2 lg:max-w-md ${rowClassName}`}>
        {!isOwn ? <div className="h-6 w-6 flex-shrink-0 animate-pulse rounded-full bg-[var(--surface-2)] motion-reduce:animate-none" /> : null}
        <div className={`rounded-2xl px-4 py-3 ${bubbleClassName}`}>
          <div className="space-y-2">
            <div className={`h-3 animate-pulse rounded motion-reduce:animate-none ${lineClassName}`} style={{ width: `${width1}px` }} />
            <div className={`h-3 animate-pulse rounded motion-reduce:animate-none ${lineClassName}`} style={{ width: `${width2}px` }} />
          </div>
          <div className={`mt-2 h-2 w-8 animate-pulse rounded motion-reduce:animate-none ${timeClassName}`} />
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string): string {
  const dateObj = new Date(value);

  if (Number.isNaN(dateObj.getTime())) {
    return CHAT_COPY.today;
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateObj.toDateString() === today.toDateString()) {
    return CHAT_COPY.today;
  }

  if (dateObj.toDateString() === yesterday.toDateString()) {
    return CHAT_COPY.yesterday;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(dateObj);
}

export const MessagePane = (props: MessagePaneProps) => {
  const {
    conversation,
    currentUser,
    hasOlderMessages,
    isChatWindowOpen = true,
    isFetchingOlderMessages,
    isLoading,
    loadOlderMessages,
    messages,
    onBackToChatList,
    onRetryMessage,
    onSendMessage,
    showBackButton = false,
  } = props;
  const messageScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const hasAutoScrolledRef = useRef(false);
  const previousConversationIdRef = useRef<string | null>(null);
  const previousMessageCountRef = useRef(0);
  const shouldStickToBottomRef = useRef(true);
  const preserveScrollPositionRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);

  const skeletonPattern = [
    { id: 's1', isOwn: false, width1: 140, width2: 80 },
    { id: 's2', isOwn: false, width1: 100, width2: 60 },
    { id: 's3', isOwn: true, width1: 120, width2: 70 },
    { id: 's4', isOwn: false, width1: 160, width2: 90 },
    { id: 's5', isOwn: true, width1: 80, width2: 50 },
    { id: 's6', isOwn: true, width1: 130, width2: 75 },
    { id: 's7', isOwn: false, width1: 110, width2: 65 },
  ] as const;

  const messageGroups = useMemo(() => {
    const groups: Record<string, ChatMessage[]> = {};
    const validMessages = messages
      .filter(message => message && message.id && message.createdAt && message.content)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    validMessages.forEach((message) => {
      const dateKey = formatDate(message.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey]?.push(message);
    });

    return groups;
  }, [messages]);

  const groupedEntries = Object.entries(messageGroups);
  const activeConversationId = conversation?.id ?? null;

  useEffect(() => {
    if (previousConversationIdRef.current === activeConversationId) {
      return;
    }

    previousConversationIdRef.current = activeConversationId;
    hasAutoScrolledRef.current = false;
    previousMessageCountRef.current = 0;
    shouldStickToBottomRef.current = true;
    preserveScrollPositionRef.current = null;
  }, [activeConversationId]);

  const handleMessageScroll = useCallback(() => {
    const container = messageScrollContainerRef.current;
    if (!container) {
      return;
    }

    const distanceFromBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
    shouldStickToBottomRef.current = distanceFromBottom <= 64;

    if (container.scrollTop > 32 || !hasOlderMessages || isFetchingOlderMessages) {
      return;
    }

    preserveScrollPositionRef.current = {
      scrollHeight: container.scrollHeight,
      scrollTop: container.scrollTop,
    };
    void loadOlderMessages();
  }, [hasOlderMessages, isFetchingOlderMessages, loadOlderMessages]);

  useLayoutEffect(() => {
    const container = messageScrollContainerRef.current;
    if (!container || !activeConversationId || isLoading) {
      return;
    }

    const preserve = preserveScrollPositionRef.current;
    if (preserve && !isFetchingOlderMessages) {
      const heightDiff = container.scrollHeight - preserve.scrollHeight;
      container.scrollTop = preserve.scrollTop + heightDiff;
      preserveScrollPositionRef.current = null;
      previousMessageCountRef.current = messages.length;
      return;
    }

    if (!hasAutoScrolledRef.current && messages.length > 0) {
      container.scrollTop = container.scrollHeight;
      hasAutoScrolledRef.current = true;
      previousMessageCountRef.current = messages.length;
      return;
    }

    if (messages.length > previousMessageCountRef.current && shouldStickToBottomRef.current) {
      container.scrollTop = container.scrollHeight;
    }

    previousMessageCountRef.current = messages.length;
  }, [activeConversationId, isFetchingOlderMessages, isLoading, messages.length]);

  if (!conversation) {
    return (
      <section className={`min-h-0 min-w-0 flex-1 flex-col bg-[var(--surface-0)] ${isChatWindowOpen ? 'flex' : 'hidden md:flex'}`}>
        <div className="flex h-full flex-col items-center justify-center px-6 py-8 text-center">
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-primary)] xl:size-24">
            <ChatBubbleIcon aria-hidden="true" className="size-10 xl:size-12" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            {CHAT_COPY.emptyTitle}
          </h2>
          <p className="mt-2 max-w-[290px] text-sm leading-6 text-[var(--text-secondary)]">
            {CHAT_COPY.emptyDescription}
          </p>
          {props.onNewChat
            ? (
                <button
                  className="mt-6 rounded-full bg-[var(--surface-inverse)] px-5 py-2.5 text-sm font-semibold text-[var(--text-inverse)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-primary)] motion-reduce:transition-none"
                  onClick={props.onNewChat}
                  type="button"
                >
                  {CHAT_COPY.newChat}
                </button>
              )
            : null}
        </div>
      </section>
    );
  }

  return (
    <section className={`min-h-0 min-w-0 flex-1 flex-col bg-[var(--surface-0)] ${isChatWindowOpen ? 'flex' : 'hidden md:flex'}`}>
      <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
        <ChatHeader
          chat={conversation.user}
          onBackToChatList={onBackToChatList}
          showBackButton={showBackButton}
        />

        {isLoading
          ? (
              <div className="min-h-0 flex-1 space-y-4 overflow-hidden p-4 sm:p-6">
                <div className="my-4 flex items-center justify-center">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-[var(--surface-2)] motion-reduce:animate-none" />
                </div>

                <div className="space-y-3">
                  {skeletonPattern.map(item => (
                    <MessageSkeleton key={item.id} id={item.id} isOwn={item.isOwn} width1={item.width1} width2={item.width2} />
                  ))}
                </div>
              </div>
            )
          : (
              <div
                className="min-h-0 min-w-0 flex-1 space-y-6 overflow-x-hidden overflow-y-auto overscroll-contain p-4 sm:p-6"
                onScroll={handleMessageScroll}
                ref={messageScrollContainerRef}
              >
                {isFetchingOlderMessages
                  ? (
                      <div className="flex justify-center">
                        <span className="px-3 py-1 text-xs text-[var(--text-muted)]">{CHAT_COPY.fetchingMessages}</span>
                      </div>
                    )
                  : null}
                {groupedEntries.length === 0
                  ? (
                      <div className="flex min-h-full items-center justify-center px-2 py-8">
                        <div className="max-w-xs text-center">
                          <div className="relative mx-auto mb-5 size-20">
                            {conversation.user.profileImage
                              ? (
                                  <Image
                                    alt={conversation.user.username}
                                    className="rounded-full object-cover"
                                    fill
                                    sizes="80px"
                                    src={conversation.user.profileImage}
                                  />
                                )
                              : (
                                  <div className="bg-primary-blue flex h-full w-full items-center justify-center rounded-full text-3xl font-bold text-white">
                                    {conversation.user.username.charAt(0).toUpperCase()}
                                  </div>
                                )}

                            {conversation.user.isOnline
                              ? (
                                  <div className="absolute right-0.5 bottom-0.5 size-4 rounded-full border-[3px] border-[var(--surface-0)] bg-emerald-500" />
                                )
                              : null}
                          </div>

                          <h3 className="text-xl font-bold [overflow-wrap:anywhere] text-[var(--text-primary)]">
                            {conversation.user.username}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                            {CHAT_COPY.conversationBeginning}
                          </p>
                        </div>
                      </div>
                    )
                  : (
                      groupedEntries.map(([dateKey, dayMessages]) => (
                        <div key={dateKey}>
                          <div className="mb-5 flex justify-center">
                            <span className="px-3 py-1 text-xs text-[var(--text-muted)]">
                              {dateKey}
                            </span>
                          </div>

                          <div className="space-y-3">
                            {dayMessages.map((message, index) => {
                              const previousMessage = dayMessages[index - 1];
                              const isOwnMessage = message.senderId === currentUser?.id;
                              const showAvatar = !previousMessage || previousMessage.senderId !== message.senderId;

                              return (
                                <MessageBubble
                                  key={message.id}
                                  message={message}
                                  isOwnMessage={isOwnMessage}
                                  showAvatar={showAvatar}
                                  chatAvatar={conversation.user.profileImage}
                                  chatName={conversation.user.username}
                                  onRetry={onRetryMessage}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
              </div>
            )}

        <MessageComposer onSubmit={onSendMessage} />
      </div>
    </section>
  );
};
