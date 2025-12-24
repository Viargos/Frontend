import { useCallback } from 'react';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { SendMessageData } from '@/types/chat.types';

/**
 * Custom hook for sending messages
 * Handles message sending with optimistic updates and error handling
 */
export function useSendMessage() {
  const { user } = useAuthStore();
  const { sendMessage, selectedChat } = useChatStore();

  const send = useCallback(
    async (content: string) => {
      if (!selectedChat || !user || !content.trim()) {
        throw new Error('Cannot send message: missing chat, user, or content');
      }

      const messageData: SendMessageData = {
        receiverId: selectedChat.id,
        content: content.trim(),
        senderId: user.id,
      };

      try {
        await sendMessage(messageData);
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },
    [selectedChat, user, sendMessage]
  );

  return { sendMessage: send, canSend: !!selectedChat && !!user };
}









