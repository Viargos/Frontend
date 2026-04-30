export type ChatUser = {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  isOnline: boolean;
  lastSeen?: string;
};

export type ChatMessage = {
  id: string;
  tempId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  status: 'pending' | 'sent' | 'failed';
  sender?: ChatUser;
  receiver?: ChatUser;
};

export type ChatConversation = {
  id: string;
  user: ChatUser;
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
};

export type ChatMessageQuery = {
  limit?: number;
  offset?: number;
};
