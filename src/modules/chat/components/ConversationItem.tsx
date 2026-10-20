'use client';

import type { ChatConversation } from '@/modules/chat/types/chat.types';
import Image from 'next/image';
import { memo } from 'react';
import { CONVERSATION_COPY } from '@/modules/chat/constants/conversation-copy';

type ConversationItemProps = {
  conversation: ChatConversation;
  isActive: boolean;
  onClick: () => void;
};

function formatTime(value: string): string {
  const dateObj = new Date(value);

  if (Number.isNaN(dateObj.getTime())) {
    return CONVERSATION_COPY.now;
  }

  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return CONVERSATION_COPY.now;
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  if (hours < 24) {
    return `${hours}h`;
  }

  return days < 7 ? `${days}d` : `${Math.floor(days / 7)}w`;
}

export const ConversationItem = memo((props: ConversationItemProps) => {
  const { conversation, isActive, onClick } = props;
  const hasUnread = conversation.unreadCount > 0;
  const containerClassName = isActive
    ? 'bg-[var(--surface-2)]'
    : 'hover:bg-[var(--surface-1)]';
  const previewClassName = hasUnread ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]';
  const unreadLabel = conversation.unreadCount > 99 ? '99+' : String(conversation.unreadCount);
  const avatarLetter = (conversation.user.username || 'U').charAt(0).toUpperCase();
  const previewText = conversation.lastMessage?.content || CONVERSATION_COPY.noMessages;
  const timeText = conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : '';

  return (
    <button
      aria-pressed={isActive}
      className={`w-full min-w-0 cursor-pointer rounded-2xl px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--text-muted)] ${containerClassName}`}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center space-x-3">
        <div className="relative flex-shrink-0">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-2)]">
            {conversation.user.profileImage
              ? (
                  <Image
                    alt={conversation.user.username || CONVERSATION_COPY.user}
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
                <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-[var(--surface-0)] bg-green-500" />
              )
            : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between">
            <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {conversation.user.username}
            </span>
            {conversation.lastMessage
              ? (
                  <span className="ml-2 flex-shrink-0 text-xs text-[var(--text-muted)]">{timeText}</span>
                )
              : null}
          </div>

          <div className="flex items-center justify-between">
            <span className={`truncate text-sm ${previewClassName}`}>
              {previewText}
            </span>
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
    </button>
  );
});

ConversationItem.displayName = 'ConversationItem';
