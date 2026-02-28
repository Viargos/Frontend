'use client';

import type { ChatMessage } from '@/modules/chat/types/chat.types';

import * as motion from 'framer-motion/client';
import Image from 'next/image';
import { memo } from 'react';
import { ClockIcon, RefreshCwIcon } from '@/modules/common/icons';

type MessageBubbleProps = {
  chatAvatar?: string;
  chatName?: string;
  isOwnMessage: boolean;
  message: ChatMessage;
  onRetry?: (messageId: string) => void;
  showAvatar: boolean;
};

function formatTime(value: string): string {
  const dateObj = new Date(value);
  if (Number.isNaN(dateObj.getTime())) {
    return 'now';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
}

export const MessageBubble = memo((props: MessageBubbleProps) => {
  const { chatAvatar, chatName, isOwnMessage, message, onRetry, showAvatar } = props;
  const directionClassName = isOwnMessage ? 'justify-end' : 'justify-start';
  const rowClassName = isOwnMessage ? 'flex-row-reverse space-x-reverse' : '';
  const bubbleClassName = isOwnMessage ? 'bg-primary-blue text-white' : 'bg-gray-100 text-gray-900';
  const metaClassName = isOwnMessage ? 'text-indigo-100' : 'text-gray-500';

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${directionClassName}`}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex max-w-xs items-end space-x-2 lg:max-w-md ${rowClassName}`}>
        {!isOwnMessage && showAvatar
          ? (
              <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full">
                <Image
                  alt={chatName || 'User'}
                  className="object-cover"
                  fill
                  sizes="24px"
                  src={chatAvatar || `https://ui-avatars.com/api/?name=${chatName || 'U'}&background=random`}
                />
              </div>
            )
          : null}

        {!isOwnMessage && !showAvatar
          ? (
              <div className="h-6 w-6 flex-shrink-0" />
            )
          : null}

        <div className={`rounded-2xl px-4 py-2 ${bubbleClassName}`}>
          <p className="text-sm">{message.content}</p>
          <div className={`mt-1 flex items-center gap-1 text-xs ${metaClassName}`}>
            <span>{formatTime(message.createdAt)}</span>
            {isOwnMessage && message.status === 'pending'
              ? (
                  <ClockIcon className="h-3 w-3" size={12} />
                )
              : null}
            {isOwnMessage && message.status === 'failed'
              ? (
                  <button
                    aria-label="Retry sending message"
                    className="inline-flex items-center gap-1 rounded px-1 text-[10px] text-red-200 underline hover:text-red-100"
                    type="button"
                    onClick={() => onRetry?.(message.id)}
                  >
                    <RefreshCwIcon className="h-3 w-3" size={12} />
                    Retry
                  </button>
                )
              : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = 'MessageBubble';
