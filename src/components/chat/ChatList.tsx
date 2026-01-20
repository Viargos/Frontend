'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChatUser } from '@/types/chat.types';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import ConversationItem from './ConversationItem';
import {
  RefreshCwIcon,
  SearchIcon,
  CloseIcon,
  ChatBubbleIcon,
  BellIcon,
  ErrorCircleIcon,
  ArrowRightIcon,
} from '@/components/icons';

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
  const isLoading = useChatStore(state => state.isLoading); // Used for initial loading skeleton
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

  // 🔄 FIX: Memoized refresh handler
  const handleRefresh = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  if (isLoading && conversations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg h-full flex flex-col overflow-hidden">
        {/* Header Skeleton */}
        <div className="p-5 border-b border-gray-100 bg-[#160E53] flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-white/30 rounded-lg w-16 animate-pulse"></div>
            <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse"></div>
          </div>
          <div className="h-10 bg-white/95 rounded-xl animate-pulse"></div>
        </div>

        {/* Conversations Skeleton */}
        <div className="flex-1 p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <motion.div
                key={i}
                className="flex items-center space-x-3 p-3 rounded-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-100 rounded-lg w-1/2 animate-pulse"></div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-5 h-5 bg-blue-200 rounded-full animate-pulse"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg h-full flex flex-col overflow-hidden">
      {/* Fixed Header with Gradient */}
      <div className="p-5 border-b border-gray-100 bg-[#160E53] flex-shrink-0 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Chats</h2>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <RefreshCwIcon className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-11 text-sm text-gray-900 placeholder-gray-400 bg-white/95 backdrop-blur-sm border-0 rounded-xl focus:ring-2 focus:ring-white/50 focus:outline-none shadow-sm"
          />
          <SearchIcon className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <CloseIcon className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <ErrorCircleIcon className="h-5 w-5 text-red-400" />
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
          <motion.div
            className="flex-1 flex items-center justify-center p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center max-w-xs">
              <motion.div
                className="relative w-24 h-24 mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl rotate-6"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  {searchQuery ? (
                    <SearchIcon className="w-10 h-10 text-white" />
                  ) : (
                    <ChatBubbleIcon className="w-10 h-10 text-white" />
                  )}
                </div>
                {!searchQuery && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full shadow-lg flex items-center justify-center"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <BellIcon className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </motion.div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No matches found' : 'Start Your Journey'}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {searchQuery
                  ? 'Try a different search term or check the spelling'
                  : 'Connect with fellow travelers and start meaningful conversations'}
              </p>
              {!searchQuery && (
                <motion.div
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <ArrowRightIcon className="w-4 h-4" />
                  Visit profiles to chat
                </motion.div>
              )}
            </div>
          </motion.div>
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

// Unused helper functions (not called anywhere in the component)
// const formatTime = (date: Date | string) => { ... }
// const truncateMessage = (content: string, maxLength: number = 50) => { ... }
