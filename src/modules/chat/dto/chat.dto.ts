export type ChatUserDto = {
  id: string;
  username: string;
  email: string;
  profileImage?: string | null;
  isOnline?: boolean;
  lastSeen?: string | null;
};

export type ChatMessageDto = {
  id: string;
  tempId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: ChatUserDto;
  receiver?: ChatUserDto;
};

export type ChatConversationDto = {
  id: string;
  user: ChatUserDto;
  lastMessage?: ChatMessageDto | null;
  unreadCount: number;
  updatedAt: string;
};

export type ChatConversationsDto = {
  conversations: ChatConversationDto[];
};

export type ChatMessagesDto = {
  messages: ChatMessageDto[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

export type ChatSendMessageDto = {
  message: ChatMessageDto;
};

export type ChatMeDto = {
  user: ChatUserDto;
};

export type ChatCreateConversationRequestDto = {
  userId: string;
};

export type ChatSendMessageRequestDto = {
  receiverId: string;
  content: string;
};
