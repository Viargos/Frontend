'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChatConversation, ChatUser } from '@/types/chat.types';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import ConversationItem from './ConversationItem';

interface ChatListProps {
  onChatSelect: (chat: ChatUser) => void;
  selectedChatId?: string;
}

export default function ChatList({
  onChatSelect,
  selectedChatId,
}: ChatListProps) {
  const { user } = useAuthStore();
  // 🔄 FIX: Zustand automatically triggers re-render when conversations change
  const conversations = useChatStore(state => state.conversations);
  const fetchConversations = useChatStore(state => state.fetchConversations);
  const isLoading = useChatStore(state => state.isLoading);
  const error = useChatStore(state => state.error);

  const [searchQuery, setSearchQuery] = useState('');

  // 🔄 FIX: Fetch conversations on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only run when user ID changes

  // 🔄 FIX: Memoize filtered conversations to prevent unnecessary recalculations
  const filteredConversations = useMemo(() => {
    return conversations.filter(
      conversation =>
        conversation?.user?.username
          ?.toLowerCase()
          ?.includes(searchQuery.toLowerCase()) ||
        conversation?.user?.email
          ?.toLowerCase()
          ?.includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const formatTime = (date: Date | string) => {
    // Ensure we have a valid Date object
    const dateObj = date instanceof Date ? date : new Date(date);

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'now';
    }

    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const truncateMessage = (content: string, maxLength: number = 50) => {
    return content.length > maxLength
      ? `${content.substring(0, maxLength)}...`
      : content;
  };

  // 🔄 FIX: Memoized refresh handler
  const handleRefresh = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  if (isLoading && conversations.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
        {/* Header Skeleton */}
        <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="h-6 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Conversations Skeleton */}
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="flex items-center space-x-3 animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-8 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
      {/* Fixed Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0 sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh conversations"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Conversations List */}
      {/* 🔄 FIX: Key prop ensures re-render when conversations change */}
      <div className="flex-1 overflow-y-auto" key={conversations.length}>
        {filteredConversations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : "Start a conversation by visiting someone's profile and clicking the Message button"}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation, index) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedChatId === conversation.user.id}
                onSelect={onChatSelect}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
