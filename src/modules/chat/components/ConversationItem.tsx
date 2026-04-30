'use client';

import type { ChatConversation } from '@/modules/chat/types/chat.types';
import Image from 'next/image';
import { memo } from 'react';

type ConversationItemProps = {
  conversation: ChatConversation;
  isActive: boolean;
  onClick: () => void;
};

function formatTime(value: string): string {
  const dateObj = new Date(value);

  if (Number.isNaN(dateObj.getTime())) {
    return 'now';
  }

  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return 'now';
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  if (hours < 24) {
    return `${hours}h`;
  }

  return `${days}d`;
}

function truncateMessage(content: string | undefined, maxLength = 50): string {
  if (!content) {
    return '';
  }

  return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content;
}

export const ConversationItem = memo((props: ConversationItemProps) => {
  const { conversation, isActive, onClick } = props;
  const hasUnread = conversation.unreadCount > 0;
  const containerClassName = isActive
    ? 'bg-primary-blue/5 border-r-2 border-primary-blue shadow-sm'
    : 'hover:shadow-sm';
  const titleClassName = isActive ? 'text-primary-blue' : 'text-gray-900';
  const previewClassName = hasUnread ? 'text-gray-900 font-medium' : 'text-gray-600';
  const unreadLabel = conversation.unreadCount > 99 ? '99+' : String(conversation.unreadCount);
  const avatarLetter = (conversation.user.username || 'U').charAt(0).toUpperCase();
  const previewText = conversation.lastMessage ? truncateMessage(conversation.lastMessage.content) : 'No messages yet';
  const timeText = conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : '';

  return (
    <div
      className={`cursor-pointer p-4 transition-all duration-200 hover:bg-gray-50 ${containerClassName}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-center space-x-3">
        <div className="relative flex-shrink-0">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-100">
            {conversation.user.profileImage
              ? (
                  <Image
                    alt={conversation.user.username || 'User'}
                    className="object-cover"
                    fill
                    sizes="48px"
                    src={conversation.user.profileImage}
                  />
                )
              : (
                  <div className="flex h-full w-full items-center justify-center bg-[#160E53] text-sm font-semibold text-white">
                    {avatarLetter}
                  </div>
                )}
          </div>
          {conversation.user.isOnline
            ? (
                <div className="absolute -right-0.5 -bottom-0.5 h-4 w-4 rounded-full border-2 border-white bg-green-400 shadow-sm" />
              )
            : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between">
            <h3 className={`truncate text-sm font-semibold ${titleClassName}`}>
              {conversation.user.username}
            </h3>
            {conversation.lastMessage
              ? (
                  <span className="ml-2 flex-shrink-0 text-xs text-gray-500">{timeText}</span>
                )
              : null}
          </div>

          <div className="flex items-center justify-between">
            <p className={`truncate text-sm ${previewClassName}`}>
              {previewText}
            </p>
            {hasUnread
              ? (
                  <span className="bg-primary-blue ml-2 inline-flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-medium text-white">
                    {unreadLabel}
                  </span>
                )
              : null}
          </div>
        </div>
      </div>
    </div>
  );
});

ConversationItem.displayName = 'ConversationItem';
