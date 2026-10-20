'use client';

import type { ChatUser } from '@/modules/chat/types/chat.types';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { memo } from 'react';
import { CHAT_COPY } from '@/modules/chat/constants/chat-copy';

type ChatHeaderProps = {
  chat: ChatUser;
  onBackToChatList?: () => void;
  showBackButton?: boolean;
};

function formatLastSeen(value?: string): string {
  if (!value) {
    return CHAT_COPY.recently;
  }

  const dateObj = new Date(value);
  if (Number.isNaN(dateObj.getTime())) {
    return CHAT_COPY.recently;
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
}

export const ChatHeader = memo((props: ChatHeaderProps) => {
  const { chat, onBackToChatList, showBackButton = false } = props;
  const avatarLetter = (chat.username || 'U').charAt(0).toUpperCase();
  const statusText = chat.isOnline ? CHAT_COPY.online : `${CHAT_COPY.lastSeen} ${formatLastSeen(chat.lastSeen)}`;

  return (
    <div className="z-10 flex h-[73px] shrink-0 items-center border-b border-[var(--border-subtle)] bg-[var(--surface-0)] px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {showBackButton
          ? (
              <button
                aria-label={CHAT_COPY.backToConversations}
                onClick={onBackToChatList}
                className="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)] motion-reduce:transition-none md:hidden"
                type="button"
              >
                <ArrowLeft aria-hidden="true" size={20} />
              </button>
            )
          : null}

        <div className="relative shrink-0">
          <div className="relative flex size-10 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-2)]">
            {chat.profileImage
              ? (
                  <Image alt={chat.username || CHAT_COPY.user} className="object-cover" fill sizes="40px" src={chat.profileImage} />
                )
              : (
                  <div className="bg-primary-blue flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                    {avatarLetter}
                  </div>
                )}
          </div>
          {chat.isOnline
            ? (
                <div className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-[var(--surface-0)] bg-emerald-500" />
              )
            : null}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-[var(--text-primary)]">{chat.username}</h2>
          <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{statusText}</p>
        </div>
      </div>
    </div>
  );
});

ChatHeader.displayName = 'ChatHeader';
