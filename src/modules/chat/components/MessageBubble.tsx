'use client';

import type { ChatMessage } from '@/modules/chat/types/chat.types';

import Image from 'next/image';
import { memo } from 'react';
import { CHAT_COPY } from '@/modules/chat/constants/chat-copy';
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
    return CHAT_COPY.now;
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
  const rowClassName = isOwnMessage ? 'flex-row-reverse' : '';
  const bubbleClassName = isOwnMessage
    ? 'rounded-br-md bg-primary-blue text-white'
    : 'rounded-bl-md bg-[var(--surface-2)] text-[var(--text-primary)]';
  const metaClassName = isOwnMessage ? 'text-white/75' : 'text-[var(--text-muted)]';

  return (
    <div className={`flex min-w-0 ${directionClassName}`}>
      <div className={`flex max-w-[90%] min-w-0 items-end gap-2 lg:max-w-[75%] ${rowClassName}`}>
        {!isOwnMessage && showAvatar
          ? (
              <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full">
                <Image
                  alt={chatName || CHAT_COPY.user}
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

        <div className={`min-w-0 rounded-2xl px-4 py-2.5 ${bubbleClassName}`}>
          <p className="text-sm leading-relaxed [overflow-wrap:anywhere] whitespace-pre-wrap">{message.content}</p>
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
                    aria-label={CHAT_COPY.retryMessage}
                    className="inline-flex items-center gap-1 rounded px-1 text-[10px] text-red-200 underline hover:text-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                    type="button"
                    onClick={() => onRetry?.(message.id)}
                  >
                    <RefreshCwIcon className="h-3 w-3" size={12} />
                    {CHAT_COPY.retry}
                  </button>
                )
              : null}
          </div>
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
