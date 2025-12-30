'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ChatUser, ChatMessage } from '@/types/chat.types';
import { useAuthStore } from '@/store/auth.store';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  chat: ChatUser;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onBackToChatList?: () => void;
  showBackButton?: boolean;
  isLoading?: boolean;
}

// Message Skeleton Component - mimics chat bubble appearance
function MessageSkeleton({
  isOwn,
  width1,
  width2,
}: {
  isOwn: boolean;
  width1: number;
  width2: number;
}) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
          isOwn ? 'flex-row-reverse space-x-reverse' : ''
        }`}
      >
        {/* Avatar skeleton (only for received messages) */}
        {!isOwn && (
          <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
        )}

        {/* Message bubble skeleton */}
        <div
          className={`px-4 py-3 rounded-2xl ${
            isOwn ? 'bg-primary-blue/20' : 'bg-gray-100'
          }`}
        >
          {/* Message content skeleton - varied widths for natural look */}
          <div className="space-y-2">
            <div
              className={`h-3 rounded ${isOwn ? 'bg-primary-blue/30' : 'bg-gray-200'} animate-pulse`}
              style={{ width: `${width1}px` }}
            />
            <div
              className={`h-3 rounded ${isOwn ? 'bg-primary-blue/30' : 'bg-gray-200'} animate-pulse`}
              style={{ width: `${width2}px` }}
            />
          </div>
          {/* Time skeleton */}
          <div
            className={`h-2 mt-2 rounded ${isOwn ? 'bg-primary-blue/20' : 'bg-gray-200'} animate-pulse w-8`}
          />
        </div>
      </div>
    </div>
  );
}

// Messages Loading Skeleton
function MessagesLoadingSkeleton() {
  // Create a pattern of messages that looks like a conversation
  // Each message has fixed widths to avoid re-render jank
  const skeletonPattern = [
    { isOwn: false, width1: 140, width2: 80 },
    { isOwn: false, width1: 100, width2: 60 },
    { isOwn: true, width1: 120, width2: 70 },
    { isOwn: false, width1: 160, width2: 90 },
    { isOwn: true, width1: 80, width2: 50 },
    { isOwn: true, width1: 130, width2: 75 },
    { isOwn: false, width1: 110, width2: 65 },
  ];

  return (
    <div className="flex-1 p-4 space-y-4 overflow-hidden">
      {/* Date separator skeleton */}
      <div className="flex items-center justify-center my-4">
        <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
      </div>

      {/* Message skeletons */}
      <div className="space-y-3">
        {skeletonPattern.map((config, index) => (
          <MessageSkeleton
            key={index}
            isOwn={config.isOwn}
            width1={config.width1}
            width2={config.width2}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatWindow({
  chat,
  messages,
  onSendMessage,
  onBackToChatList,
  showBackButton = false,
  isLoading = false,
}: ChatWindowProps) {
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevMessagesLengthRef = useRef(messages.length);
  const prevChatIdRef = useRef(chat.id);
  const prevLoadingRef = useRef(isLoading);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🔄 FIX: Check if user is at bottom of scroll container
  const checkIfAtBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true; // Default to true if container not ready
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 100; // 100px threshold
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  // 🔄 FIX: Reliable scroll to bottom function with retry logic
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const attemptScroll = (attempts = 0) => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior });
      } else if (attempts < 3) {
        // Retry if ref not ready yet
        setTimeout(() => attemptScroll(attempts + 1), 100);
      }
    };
    attemptScroll();
  }, []);

  // 🔄 FIX: Reset scroll state when chat changes
  useEffect(() => {
    if (prevChatIdRef.current !== chat.id) {
      setShouldAutoScroll(true);
      prevChatIdRef.current = chat.id;
      prevMessagesLengthRef.current = 0;
    }
  }, [chat.id]);

  // 🔄 FIX: Scroll to bottom when loading finishes and messages are ready
  useEffect(() => {
    // Detect when loading just finished (was loading, now not loading)
    const loadingJustFinished = prevLoadingRef.current && !isLoading;
    prevLoadingRef.current = isLoading;

    if (loadingJustFinished && messages.length > 0) {
      // Use multiple timeouts to ensure DOM is fully rendered
      const timeouts = [50, 150, 300];
      timeouts.forEach(delay => {
        setTimeout(() => {
          scrollToBottom('auto');
        }, delay);
      });
    }
  }, [isLoading, messages.length, scrollToBottom]);

  // 🔄 FIX: Auto-scroll to bottom when messages change
  useEffect(() => {
    // Clear any pending scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Skip if loading
    if (isLoading) {
      prevMessagesLengthRef.current = messages.length;
      return;
    }

    // If messages were added (not removed), check if we should scroll
    const messagesAdded = messages.length > prevMessagesLengthRef.current;
    const isInitialLoad = prevMessagesLengthRef.current === 0 && messages.length > 0;

    if (messagesAdded || isInitialLoad) {
      const wasAtBottom = checkIfAtBottom();
      const shouldScroll = wasAtBottom || isInitialLoad;

      if (shouldScroll) {
        // 🔄 FIX: Use requestAnimationFrame for smooth DOM updates
        requestAnimationFrame(() => {
          scrollTimeoutRef.current = setTimeout(() => {
            scrollToBottom(isInitialLoad ? 'auto' : 'smooth');
            setShouldAutoScroll(true);
          }, 50);
        });
      } else {
        setShouldAutoScroll(false);
      }
    }

    prevMessagesLengthRef.current = messages.length;

    // Cleanup timeout on unmount
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages, isLoading, checkIfAtBottom, scrollToBottom]);

  // 🔄 FIX: Scroll to bottom on initial load or when chat changes
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      // Delay to ensure DOM is fully rendered after switching chats
      const timeoutId = setTimeout(() => {
        scrollToBottom('auto');
        setShouldAutoScroll(true);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [chat.id, isLoading, messages.length, scrollToBottom]);

  // 🔄 FIX: Handle scroll events to update shouldAutoScroll
  const handleScroll = useCallback(() => {
    setShouldAutoScroll(checkIfAtBottom());
  }, [checkIfAtBottom]);

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return 'Today';
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateObj.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (dateObj.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      }).format(dateObj);
    }
  };

  // 🔄 FIX: Memoize message grouping to prevent unnecessary recalculations
  const messageGroups = useMemo(() => {
    const groups: { [key: string]: ChatMessage[] } = {};

    // Filter out any undefined or invalid messages and sort by timestamp
    const validMessages = messages
      .filter(
        message => message && message.id && message.createdAt && message.content
      )
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeA - timeB; // ASC order
      });

    validMessages.forEach(message => {
      const dateKey = formatDate(message.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  }, [messages]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
      {/* Chat Header */}
      <ChatHeader
        chat={chat}
        onBackToChatList={onBackToChatList}
        showBackButton={showBackButton}
      />

      {/* Messages Area */}
      {isLoading ? (
        <MessagesLoadingSkeleton />
      ) : (
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 p-4 space-y-4 overflow-y-auto"
          style={{ scrollBehavior: 'smooth' }}
        >
          {Object.keys(messageGroups).length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Start a conversation
                </h3>
                <p className="text-gray-500">
                  Send a message to begin chatting with {chat.name || chat.username}
                </p>
              </div>
            </div>
          ) : (
          Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                  {date}
                </span>
              </div>

              {/* Messages for this date */}
              <div className="space-y-3">
                {dateMessages.map((message, index) => {
                  const isOwnMessage = message.senderId === user?.id;
                  const showAvatar =
                    index === 0 ||
                    dateMessages[index - 1].senderId !== message.senderId;

                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwnMessage={isOwnMessage}
                      showAvatar={showAvatar}
                      chatAvatar={chat.profileImage}
                      chatName={chat.name || chat.username}
                    />
                  );
                })}
              </div>
            </div>
          ))
          )}
          {/* 🔄 FIX: Scroll anchor - ensures we can scroll to bottom */}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}
