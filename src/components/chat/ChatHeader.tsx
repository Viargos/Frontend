'use client';

import Image from 'next/image';
import { ChatUser } from '@/types/chat.types';

interface ChatHeaderProps {
  chat: ChatUser;
  onBackToChatList?: () => void;
  showBackButton?: boolean;
}

export default function ChatHeader({
  chat,
  onBackToChatList,
  showBackButton = false,
}: ChatHeaderProps) {
  const formatTime = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return 'now';
    }

    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj);
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0 sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        {/* Back Button for Mobile */}
        {showBackButton && (
          <button
            onClick={onBackToChatList}
            className="md:hidden p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {chat.profileImage && chat.profileImage.trim() !== '' ? (
              <Image
                src={chat.profileImage}
                alt={chat.username || 'User'}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  // Hide the image and show initials instead
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-primary-blue to-primary-blue/80 flex items-center justify-center text-white font-semibold text-sm">
                        ${(chat.username || 'U').charAt(0).toUpperCase()}
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-blue to-primary-blue/80 flex items-center justify-center text-white font-semibold text-sm">
                {(chat.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {chat.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {chat.username}
          </h3>
          <p className="text-sm text-gray-500">
            {chat.isOnline
              ? 'Online'
              : `Last seen ${
                  chat.lastSeen ? formatTime(chat.lastSeen) : 'recently'
                }`}
          </p>
        </div>
      </div>
    </div>
  );
}
