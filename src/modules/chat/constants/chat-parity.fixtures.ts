import type { ChatConversation } from '@/modules/chat/types/chat.types';

export function getChatParityFixtureConversations(): ChatConversation[] {
  return [
    {
      id: 'chat-parity-conversation-1',
      user: {
        id: 'chat-parity-user-2',
        username: 'Aarav Patel',
        email: 'aarav@example.com',
        profileImage: '',
        isOnline: true,
      },
      lastMessage: {
        id: 'chat-parity-message-1',
        senderId: 'chat-parity-user-2',
        receiverId: 'chat-parity-user-1',
        content: 'See you at the meetup point!',
        isRead: true,
        createdAt: '2026-02-01T10:15:00.000Z',
        status: 'sent',
      },
      unreadCount: 0,
      updatedAt: '2026-02-01T10:15:00.000Z',
    },
  ];
}
