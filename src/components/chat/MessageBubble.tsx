'use client';

import { motion } from 'framer-motion';
import { ChatMessage } from '@/types/chat.types';

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
          <p
            className={`text-xs mt-1 ${
              isOwnMessage ? 'text-indigo-100' : 'text-gray-500'
            }`}
          >
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
