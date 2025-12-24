'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChatConversation } from '@/types/chat.types';

interface ConversationItemProps {
  conversation: ChatConversation;
  isSelected: boolean;
  onSelect: (user: any) => void;
  index: number;
}

function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  index,
}: ConversationItemProps) {
  const handleClick = () => {
    onSelect(conversation.user);
  };

  const formatTime = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);

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

  return (
    <div
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
        isSelected
          ? 'bg-primary-blue/5 border-r-2 border-primary-blue shadow-sm'
          : 'hover:shadow-sm'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-100 bg-gray-100 flex items-center justify-center">
            {conversation.user.profileImage ? (
              <Image
                src={conversation.user.profileImage}
                alt={conversation.user.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  // Hide the image and show initials instead
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-primary-blue to-primary-blue/80 flex items-center justify-center text-white font-semibold text-sm">
                        ${(conversation.user.username || 'U')
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-blue to-primary-blue/80 flex items-center justify-center text-white font-semibold text-sm">
                {(conversation.user.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {conversation.user.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={`text-sm font-semibold truncate ${
                isSelected ? 'text-primary-blue' : 'text-gray-900'
              }`}
            >
              {conversation.user.username}
            </h3>
            {conversation.lastMessage && (
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {formatTime(conversation.lastMessage.createdAt)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p
              className={`text-sm truncate ${
                conversation.unreadCount > 0
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-600'
              }`}
            >
              {conversation.lastMessage
                ? truncateMessage(conversation.lastMessage.content)
                : 'No messages yet'}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-white bg-primary-blue rounded-full flex-shrink-0 ml-2">
                {conversation.unreadCount > 99
                  ? '99+'
                  : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
// Only re-render if conversation data or selection status changes
// Ignore onSelect function changes
export default memo(ConversationItem, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  // Return false if props are different (re-render)
  return (
    prevProps.conversation.id === nextProps.conversation.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.conversation.lastMessage?.id === nextProps.conversation.lastMessage?.id &&
    prevProps.conversation.lastMessage?.content === nextProps.conversation.lastMessage?.content &&
    prevProps.conversation.lastMessage?.createdAt === nextProps.conversation.lastMessage?.createdAt &&
    prevProps.conversation.unreadCount === nextProps.conversation.unreadCount &&
    prevProps.conversation.user.isOnline === nextProps.conversation.user.isOnline
  );
});
