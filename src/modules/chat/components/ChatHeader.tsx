'use client';

import type { ChatUser } from '@/modules/chat/types/chat.types';
import Image from 'next/image';
import { memo } from 'react';

type ChatHeaderProps = {
  chat: ChatUser;
  onBackToChatList?: () => void;
  showBackButton?: boolean;
};

function formatLastSeen(value?: string): string {
  if (!value) {
    return 'recently';
  }

  const dateObj = new Date(value);
  if (Number.isNaN(dateObj.getTime())) {
    return 'recently';
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
  const statusText = chat.isOnline ? 'Online' : `Last seen ${formatLastSeen(chat.lastSeen)}`;

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 border-b border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center space-x-3">
        {showBackButton
          ? (
              <button
                aria-label="Back to conversations"
                onClick={onBackToChatList}
                className="rounded-lg p-2 transition-colors hover:bg-gray-200 md:hidden"
                type="button"
              >
                <span className="text-base leading-none text-gray-600" aria-hidden="true">←</span>
              </button>
            )
          : null}

        <div className="relative">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            {chat.profileImage
              ? (
                  <Image alt={chat.username || 'User'} className="object-cover" fill sizes="40px" src={chat.profileImage} />
                )
              : (
                  <div className="flex h-full w-full items-center justify-center bg-[#160E53] text-sm font-semibold text-white">
                    {avatarLetter}
                  </div>
                )}
          </div>
          {chat.isOnline
            ? (
                <div className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
              )
            : null}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{chat.username}</h3>
          <p className="text-sm text-gray-500">{statusText}</p>
        </div>
      </div>
    </div>
  );
});

ChatHeader.displayName = 'ChatHeader';
