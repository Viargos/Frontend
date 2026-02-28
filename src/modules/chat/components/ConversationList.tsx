'use client';

import type { ChatConversation } from '@/modules/chat/types/chat.types';
import * as motion from 'framer-motion/client';
import { useMemo, useState } from 'react';
import { ConversationItem } from '@/modules/chat/components/ConversationItem';
import { ChatBubbleIcon, ExploreIcon } from '@/modules/common/icons';

type ConversationListProps = {
  conversations: ChatConversation[];
  isLoading: boolean;
  onSelect: (conversationId: string) => void;
  selectedConversationId: string | null;
};

export const ConversationList = (props: ConversationListProps) => {
  const { conversations, isLoading, onSelect, selectedConversationId } = props;
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = useMemo(
    () => conversations.reduce((total, conversation) => total + conversation.unreadCount, 0),
    [conversations],
  );

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }

    const query = searchQuery.toLowerCase();
    return conversations.filter(conversation => conversation.user.username.toLowerCase().includes(query));
  }, [conversations, searchQuery]);

  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-100 bg-[#160E53] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-24 animate-pulse rounded-lg bg-white/30" />
            <div className="flex gap-2">
              <div className="h-7 w-12 animate-pulse rounded-lg bg-white/20" />
              <div className="h-7 w-12 animate-pulse rounded-lg bg-white/20" />
            </div>
          </div>
          <div className="h-10 animate-pulse rounded-xl bg-white/95" />
        </div>

        <div className="flex-1 space-y-3 p-4">
          {[1, 2, 3, 4, 5].map(index => (
            <motion.div
              key={index}
              className="flex items-center space-x-3 rounded-xl bg-gray-50 p-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  const totalConversations = conversations.length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b border-gray-100 bg-gradient-to-br from-[#160E53] to-[#2a1f6f] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 text-white"></span>
            <h2 className="text-lg font-semibold text-white">Messages</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1">
              <span className="h-4 w-4 text-white/80"></span>
              <span className="text-sm font-medium text-white">{totalConversations}</span>
            </div>
            {unreadCount > 0
              ? (
                  <div className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-2.5 py-1">
                    <div className="h-2 w-2 rounded-full bg-red-400" />
                    <span className="text-sm font-medium text-white">{unreadCount}</span>
                  </div>
                )
              : null}
          </div>
        </div>

        <div className="relative mt-4">
          <ExploreIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            className="w-full rounded-xl border-none bg-white/95 py-2.5 pr-10 pl-10 text-gray-900 placeholder-gray-500 transition-all focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          {searchQuery
            ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute top-1/2 right-3 -translate-y-1/2 transform rounded-full p-1 transition-colors hover:bg-gray-100"
                  type="button"
                >
                  <span className="h-4 w-4 text-gray-400" aria-hidden="true">×</span>
                </button>
              )
            : null}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {filteredConversations.length === 0
          ? (
              <div className="flex h-full flex-col items-center justify-center px-4 text-gray-500">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-300">
                  <ChatBubbleIcon className="h-8 w-8" />
                </div>
                <p className="mb-1 text-sm font-medium text-gray-700">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
                <p className="text-center text-xs text-gray-500">
                  {searchQuery ? 'Try adjusting your search' : 'Start a conversation to see it here'}
                </p>
              </div>
            )
          : (
              <motion.div
                className="space-y-2"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.05 },
                  },
                }}
              >
                {filteredConversations.map(conversation => (
                  <motion.div
                    key={conversation.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <ConversationItem
                      conversation={conversation}
                      isActive={selectedConversationId === conversation.id}
                      onClick={() => onSelect(conversation.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
      </div>

      {/* keep old error block position below header and above list when error pattern is needed */}
      {/*
        Structural lock scope: this component mirrors old list/header/item hierarchy.
        Network error surfaces remain handled by parent hook state.
      */}
    </div>
  );
};
