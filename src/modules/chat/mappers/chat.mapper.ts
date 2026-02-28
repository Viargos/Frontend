import type {
  ChatConversationDto,
  ChatConversationsDto,
  ChatMessageDto,
  ChatMessagesDto,
  ChatUserDto,
} from '@/modules/chat/dto/chat.dto';
import type { ChatConversation, ChatMessage, ChatUser } from '@/modules/chat/types/chat.types';

function assertChatUserDto(dto: ChatUserDto): void {
  if (!dto || typeof dto.id !== 'string' || typeof dto.username !== 'string' || typeof dto.email !== 'string') {
    throw new Error('Invalid chat user response payload');
  }
}

export function mapChatUser(dto: ChatUserDto): ChatUser {
  assertChatUserDto(dto);

  return {
    email: dto.email,
    id: dto.id,
    isOnline: dto.isOnline ?? false,
    lastSeen: dto.lastSeen ?? undefined,
    profileImage: dto.profileImage ?? undefined,
    username: dto.username,
  };
}

export function mapChatMessage(dto: ChatMessageDto): ChatMessage {
  return {
    content: dto.content,
    createdAt: dto.createdAt,
    id: dto.id,
    isRead: dto.isRead,
    receiver: dto.receiver ? mapChatUser(dto.receiver) : undefined,
    receiverId: dto.receiverId,
    sender: dto.sender ? mapChatUser(dto.sender) : undefined,
    senderId: dto.senderId,
    status: 'sent',
    tempId: dto.tempId,
  };
}

export function mapChatConversation(dto: ChatConversationDto): ChatConversation {
  return {
    id: dto.id,
    lastMessage: dto.lastMessage ? mapChatMessage(dto.lastMessage) : undefined,
    unreadCount: dto.unreadCount,
    updatedAt: dto.updatedAt,
    user: mapChatUser(dto.user),
  };
}

export function mapChatConversations(dto: ChatConversationsDto): ChatConversation[] {
  return (dto.conversations ?? []).map(mapChatConversation);
}

export function mapChatMessages(dto: ChatMessagesDto): ChatMessage[] {
  return (dto.messages ?? []).map(mapChatMessage);
}
