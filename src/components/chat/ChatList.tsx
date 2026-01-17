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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg h-full flex flex-col overflow-hidden">
        {/* Header Skeleton */}
        <div className="p-5 border-b border-gray-100 bg-[#001A6E] flex-shrink-0">
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
      <div className="p-5 border-b border-gray-100 bg-[#001A6E] flex-shrink-0 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Chats</h2>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
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
          <svg
            className="absolute left-4 top-3 w-4 h-4 text-gray-400"
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
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
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
                transition={{ duration: 0.5, type: "spring" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl rotate-6"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  {searchQuery ? (
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
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
                      ease: "easeInOut",
                    }}
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
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
