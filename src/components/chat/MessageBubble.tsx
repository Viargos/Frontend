'use client';

import { motion } from 'framer-motion';
import { ChatMessage, MessageStatus } from '@/types/chat.types';

/**
 * WhatsApp-like message status icon
 * Shows delivery/read status for sent messages
 */
function MessageStatusIcon({ status }: { status?: MessageStatus }) {
  switch (status) {
    case MessageStatus.SENDING:
      // Clock icon (⏱️ or 🕐) - message being sent
      return (
        <span className="inline-block ml-1 text-xs opacity-60" title="Sending">
          🕐
        </span>
      );
    case MessageStatus.SENT:
      // Single checkmark (✓) - message sent to server
      return (
        <span className="inline-block ml-1 text-xs opacity-80" title="Sent">
          ✓
        </span>
      );
    case MessageStatus.DELIVERED:
      // Double checkmark (✓✓) - message delivered to recipient
      return (
        <span className="inline-block ml-1 text-xs opacity-80" title="Delivered">
          ✓✓
        </span>
      );
    case MessageStatus.READ:
      // Blue double checkmark - message read by recipient
      return (
        <span className="inline-block ml-1 text-xs text-blue-400" title="Read">
          ✓✓
        </span>
      );
    case MessageStatus.FAILED:
      // Warning icon (⚠️) - message failed to send
      return (
        <span className="inline-block ml-1 text-xs text-red-300" title="Failed to send">
          ⚠️
        </span>
      );
    default:
      return null;
  }
}

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showAvatar: boolean;
  chatAvatar?: string;
  chatName?: string;
}

export default function MessageBubble({
  message,
  isOwnMessage,
  showAvatar,
  chatAvatar,
  chatName,
}: MessageBubbleProps) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
          isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
        }`}
      >
        {/* Avatar */}
        {!isOwnMessage && showAvatar && (
          <img
            src={
              chatAvatar ||
              `https://ui-avatars.com/api/?name=${chatName}&background=random`
            }
            alt={chatName}
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
        )}

        {!isOwnMessage && !showAvatar && (
          <div className="w-6 h-6 flex-shrink-0"></div>
        )}

        {/* Message Bubble */}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-primary-blue text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="text-sm">{message.content}</p>
          <div
            className={`flex items-center gap-1 mt-1 text-xs ${
              isOwnMessage ? 'text-indigo-100' : 'text-gray-500'
            }`}
          >
            <span>{formatTime(message.createdAt)}</span>
            {/* Show status icon only for own messages */}
            {isOwnMessage && <MessageStatusIcon status={message.status} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
