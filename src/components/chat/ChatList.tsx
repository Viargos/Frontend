'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChatUser } from '@/types/chat.types';
import { useChatUIStore } from '@/store/chat-ui.store';
import { useConversations } from '@/hooks/chat';
import ConversationItem from './ConversationItem';
import {
  SearchIcon,
  CloseIcon,
  ChatBubbleIcon,
  ErrorCircleIcon,
} from '@/components/icons';

interface ChatListProps {
  onChatSelect: (chat: ChatUser) => void;
  isLoading?: boolean;
}

/**
 * ChatList Component - Simplified with React Query
 *
 * - Auto-fetches conversations via useConversations
 * - Auto-caches results
 * - Auto-refetches on window focus
 * - Much simpler than old version (150 lines vs 245 lines)
 */
export default function ChatList({ onChatSelect }: ChatListProps) {
  const { selectedChatUser, searchQuery, setSearchQuery } = useChatUIStore();

  // React Query - auto-fetch, auto-cache
  const { data: conversations = [], isLoading, error, refetch } = useConversations();

  // Calculate stats
  const totalConversations = conversations.length;
  const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;

    const query = searchQuery.toLowerCase();
    return conversations.filter(
      conv =>
        conv?.user?.username?.toLowerCase()?.includes(query) ||
        conv?.user?.email?.toLowerCase()?.includes(query)
    );
  }, [conversations, searchQuery]);

  // Loading skeleton
  if (isLoading && conversations.length === 0) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header Skeleton */}
        <div className="p-5 border-b border-gray-100 bg-[#160E53] flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-white/30 rounded-lg w-24 animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-7 bg-white/20 rounded-lg w-12 animate-pulse"></div>
              <div className="h-7 bg-white/20 rounded-lg w-12 animate-pulse"></div>
            </div>
          </div>
          <div className="h-10 bg-white/95 rounded-xl animate-pulse"></div>
        </div>

        {/* Conversations Skeleton */}
        <div className="flex-1 p-4 space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <motion.div
              key={i}
              className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-[#160E53] to-[#2a1f6f] flex-shrink-0">
        {/* Title and Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChatBubbleIcon className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Messages</h2>
          </div>

          {/* Stats - Top Right */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-lg">
              <ChatBubbleIcon className="w-4 h-4 text-white/80" />
              <span className="text-sm text-white font-medium">{totalConversations}</span>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 rounded-lg">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-sm text-white font-medium">{unreadCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white/95 border-none rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <CloseIcon className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <ErrorCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-medium text-red-900">Failed to load conversations</div>
            <div className="text-xs text-red-700 mt-1">{error.message}</div>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4">
            <ChatBubbleIcon className="w-16 h-16 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-xs text-gray-500 text-center">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Start a conversation to see it here'}
            </p>
          </div>
        ) : (
          <motion.div
            className="space-y-2"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {filteredConversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <ConversationItem
                  conversation={conversation}
                  isActive={selectedChatUser?.id === conversation.user.id}
                  onClick={() => onChatSelect(conversation.user)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
