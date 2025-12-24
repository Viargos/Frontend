export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  sender?: ChatUser;
  receiver?: ChatUser;
}

export interface ChatUser {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  bio?: string;
  // Computed field for display name
  name?: string; // This will be username for display purposes
}

export interface ChatConversation {
  id: string;
  user: ChatUser;
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: Date;
}

export interface ChatState {
  conversations: ChatConversation[];
  selectedChat: ChatUser | null;
  messages: ChatMessage[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SendMessageData {
  receiverId: string;
  content: string;
  senderId?: string;
}

export interface WebSocketMessage {
  type:
    | 'newMessage'
    | 'messageSent'
    | 'markAsRead'
    | 'userOnline'
    | 'userOffline'
    | 'error';
  data: any;
}

// DTOs for API requests
export interface CreateMessageDto {
  receiverId: string;
  content: string;
}

export interface MarkReadDto {
  messageIds: string[];
}

export interface SearchUsersDto {
  q?: string;
  limit?: number;
  offset?: number;
}

export interface GetMessagesDto {
  limit?: number;
  offset?: number;
}
