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
}

export default function ChatWindow({
  chat,
  messages,
  onSendMessage,
  onBackToChatList,
  showBackButton = false,
}: ChatWindowProps) {
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevMessagesLengthRef = useRef(messages.length);
  const prevChatIdRef = useRef(chat.id);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);

  // 🔄 FIX: Check if user is at bottom of scroll container
  const checkIfAtBottom = useCallback(() => {
    if (!messagesContainerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 100; // 100px threshold
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  // 🔄 FIX: Scroll to bottom function with proper handling
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current && !isScrollingRef.current) {
      isScrollingRef.current = true;
      messagesEndRef.current.scrollIntoView({ behavior });
      // Reset scrolling flag after animation
      setTimeout(() => {
        isScrollingRef.current = false;
      }, behavior === 'smooth' ? 500 : 0);
    }
  }, []);

  // 🔄 FIX: Reset scroll state when chat changes
  useEffect(() => {
    if (prevChatIdRef.current !== chat.id) {
      setShouldAutoScroll(true);
      prevChatIdRef.current = chat.id;
      prevMessagesLengthRef.current = 0;
      // Scroll to bottom immediately when chat changes
      setTimeout(() => {
        scrollToBottom('auto');
      }, 100);
    }
  }, [chat.id, scrollToBottom]);

  // 🔄 FIX: Auto-scroll to bottom when messages change, but only if user is at bottom
  useEffect(() => {
    // Clear any pending scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // If messages were added (not removed), check if we should scroll
    const messagesAdded = messages.length > prevMessagesLengthRef.current;
    
    if (messagesAdded) {
      const wasAtBottom = checkIfAtBottom();
      const shouldScroll = wasAtBottom || prevMessagesLengthRef.current === 0;

      if (shouldScroll) {
        // 🔄 FIX: Use requestAnimationFrame for smooth DOM updates
        requestAnimationFrame(() => {
          scrollTimeoutRef.current = setTimeout(() => {
            scrollToBottom('smooth');
            setShouldAutoScroll(true);
          }, 50);
        });
      } else {
        setShouldAutoScroll(false);
      }
    } else if (messages.length < prevMessagesLengthRef.current) {
      // Messages were removed or replaced, don't auto-scroll
      setShouldAutoScroll(false);
    }

    prevMessagesLengthRef.current = messages.length;

    // Cleanup timeout on unmount
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages, checkIfAtBottom, scrollToBottom]);

  // 🔄 FIX: Scroll to bottom on initial load or when chat changes
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      // Use auto scroll for initial load
      requestAnimationFrame(() => {
        scrollToBottom('auto');
        setShouldAutoScroll(true);
      });
    }
  }, [chat.id, scrollToBottom]); // When chat changes

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

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}
