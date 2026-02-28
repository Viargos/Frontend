'use client';

import type { ChatConversation, ChatMessage, ChatUser } from '@/modules/chat/types/chat.types';
import * as motion from 'framer-motion/client';
import Image from 'next/image';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { ChatHeader } from '@/modules/chat/components/ChatHeader';
import { MessageBubble } from '@/modules/chat/components/MessageBubble';
import { MessageComposer } from '@/modules/chat/components/MessageComposer';
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
  const bubbleClassName = isOwn ? 'bg-primary-blue/20' : 'bg-gray-100';
  const lineClassName = isOwn ? 'bg-primary-blue/30' : 'bg-gray-200';
  const timeClassName = isOwn ? 'bg-primary-blue/20' : 'bg-gray-200';

  return (
    <div className={`flex ${directionClassName}`}>
      <div className={`flex max-w-xs items-end space-x-2 lg:max-w-md ${rowClassName}`}>
        {!isOwn ? <div className="h-6 w-6 flex-shrink-0 animate-pulse rounded-full bg-gray-200" /> : null}
        <div className={`rounded-2xl px-4 py-3 ${bubbleClassName}`}>
          <div className="space-y-2">
            <div className={`h-3 animate-pulse rounded ${lineClassName}`} style={{ width: `${width1}px` }} />
            <div className={`h-3 animate-pulse rounded ${lineClassName}`} style={{ width: `${width2}px` }} />
          </div>
          <div className={`mt-2 h-2 w-8 animate-pulse rounded ${timeClassName}`} />
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string): string {
  const dateObj = new Date(value);

  if (Number.isNaN(dateObj.getTime())) {
    return 'Today';
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateObj.toDateString() === today.toDateString()) {
    return 'Today';
  }

  if (dateObj.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
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
      <section className={`flex-1 flex-col ${isChatWindowOpen ? 'flex' : 'hidden md:flex'}`}>
        <div className="flex h-full flex-col items-center justify-center px-6 text-center text-gray-500">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <ChatBubbleIcon className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No conversation selected
          </h3>
          <p className="text-sm">
            Select a conversation from the list to start chatting
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`flex-1 flex-col ${isChatWindowOpen ? 'flex' : 'hidden md:flex'}`}>
      <div className="flex h-full flex-col overflow-hidden">
        <ChatHeader
          chat={conversation.user}
          onBackToChatList={onBackToChatList}
          showBackButton={showBackButton}
        />

        {isLoading
          ? (
              <div className="flex-1 space-y-4 overflow-hidden p-4">
                <div className="my-4 flex items-center justify-center">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
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
                className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4"
                onScroll={handleMessageScroll}
                ref={messageScrollContainerRef}
              >
                {isFetchingOlderMessages
                  ? (
                      <div className="flex justify-center">
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-500">Fetching earlier messages</span>
                      </div>
                    )
                  : null}
                {groupedEntries.length === 0
                  ? (
                      <div className="flex h-full min-h-[400px] items-center justify-center p-8">
                        <motion.div
                          className="max-w-md text-center"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.div
                            className="relative mx-auto mb-6 h-24 w-24"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                          >
                            {conversation.user.profileImage
                              ? (
                                  <Image
                                    alt={conversation.user.username}
                                    className="rounded-full border-4 border-blue-100 object-cover shadow-lg"
                                    fill
                                    sizes="96px"
                                    src={conversation.user.profileImage}
                                  />
                                )
                              : (
                                  <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-blue-100 bg-[#160E53] text-3xl font-bold text-white shadow-lg">
                                    {conversation.user.username.charAt(0).toUpperCase()}
                                  </div>
                                )}

                            {conversation.user.isOnline
                              ? (
                                  <div className="absolute right-1 bottom-1 h-6 w-6 rounded-full border-4 border-white bg-green-500 shadow-sm" />
                                )
                              : null}
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <h3 className="mb-2 text-2xl font-bold text-gray-900">
                              {conversation.user.username}
                            </h3>
                            <p className="mb-6 leading-relaxed text-gray-600">
                              This is the beginning of your conversation with
                              {' '}
                              <span className="font-semibold text-blue-600">{conversation.user.username}</span>
                              . Say hi and start your travel story.
                            </p>
                          </motion.div>
                        </motion.div>
                      </div>
                    )
                  : (
                      groupedEntries.map(([dateKey, dayMessages]) => (
                        <div key={dateKey}>
                          <div className="mb-4 flex justify-center">
                            <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-500">
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
