import {
  ChatConversation,
  ChatMessage,
  ChatUser,
  CreateMessageDto,
  MarkReadDto,
  SearchUsersDto,
  GetMessagesDto,
} from '@/types/chat.types';

export interface IChatService {
  getCurrentUser(): Promise<{ user: ChatUser }>;
  searchUsers(searchUsersDto: SearchUsersDto): Promise<{ users: ChatUser[] }>;
  getUserById(userId: string): Promise<{ user: ChatUser }>;
  getConversations(): Promise<{ conversations: ChatConversation[] }>;
  createConversation(
    userId: string
  ): Promise<{ conversation: ChatConversation }>;
  getConversation(
    conversationId: string
  ): Promise<{ conversation: ChatConversation }>;
  markConversationAsRead(conversationId: string): Promise<{ success: boolean }>;
  deleteConversation(conversationId: string): Promise<{ success: boolean }>;
  getMessages(
    conversationId: string,
    getMessagesDto: GetMessagesDto
  ): Promise<{ messages: ChatMessage[]; pagination: any }>;
  sendMessage(
    createMessageDto: CreateMessageDto
  ): Promise<{ message: ChatMessage }>;
  markMessageAsRead(messageId: string): Promise<{ success: boolean }>;
  markMessagesAsRead(markReadDto: MarkReadDto): Promise<{ success: boolean }>;
  updateMessage(
    messageId: string,
    content: string
  ): Promise<{ message: ChatMessage }>;
  deleteMessage(messageId: string): Promise<{ success: boolean }>;
  getOnlineUsers(): Promise<{ users: ChatUser[] }>;
  updateUserStatus(isOnline: boolean): Promise<{ success: boolean }>;
}

