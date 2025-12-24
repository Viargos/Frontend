import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ChatState,
  ChatMessage,
  ChatUser,
  ChatConversation,
  SendMessageData,
} from '@/types/chat.types';
import { chatService } from '@/lib/services/service-factory';
import { WebSocketService } from '@/lib/services/websocket.service';
import { useAuthStore } from './auth.store';

interface ChatStore extends ChatState {
  // Actions
  setConversations: (conversations: ChatConversation[]) => void;
  addConversation: (conversation: ChatConversation) => void;
  updateConversation: (
    conversationId: string,
    updates: Partial<ChatConversation>
  ) => void;
  removeConversation: (conversationId: string) => void;

  setSelectedChat: (chat: ChatUser | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  markMessageAsRead: (messageId: string) => void;
  markConversationAsRead: (conversationId: string) => void;

  setConnectionStatus: (isConnected: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // WebSocket actions
  sendMessage: (data: SendMessageData) => Promise<void>;
  connect: () => void;
  disconnect: () => void;

  // Conversation management
  createConversation: (userId: string) => Promise<ChatConversation>;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  joinChatRoom: (conversationId: string) => void;
  leaveChatRoom: (conversationId: string) => void;

  // Reset store
  reset: () => void;
  clearConversations: () => void;
}

const initialState: ChatState = {
  conversations: [],
  selectedChat: null,
  messages: [],
  isConnected: false,
  isLoading: false,
  error: null,
};

// WebSocket service instance
let wsService: WebSocketService | null = null;

// Helper function to sort messages by timestamp ASC (oldest first)
const sortMessagesAsc = (messages: ChatMessage[]): ChatMessage[] => {
  return [...messages].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return timeA - timeB;
  });
};

// Helper function to sort conversations by last message time (newest first)
const sortConversationsByLastMessage = (
  conversations: ChatConversation[]
): ChatConversation[] => {
  return [...conversations].sort((a, b) => {
    const timeA = a.lastMessage
      ? new Date(a.lastMessage.createdAt).getTime()
      : new Date(a.updatedAt).getTime();
    const timeB = b.lastMessage
      ? new Date(b.lastMessage.createdAt).getTime()
      : new Date(b.updatedAt).getTime();
    return timeB - timeA; // Descending order (newest first)
  });
};

// Helper function to get conversation ID from two user IDs
const getConversationId = (userId1: string, userId2: string): string => {
  return userId1 < userId2 ? `${userId1}__${userId2}` : `${userId2}__${userId1}`;
};

// Helper function to find conversation by user ID
const findConversationByUserId = (
  conversations: ChatConversation[],
  userId: string
): ChatConversation | undefined => {
  return conversations.find(conv => conv.user.id === userId);
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Conversation management
      setConversations: conversations => {
        const sorted = sortConversationsByLastMessage(conversations);
        set({ conversations: sorted });
      },

      addConversation: conversation => {
        set(state => {
          // Check if conversation already exists
          const existingIndex = state.conversations.findIndex(
            c => c.id === conversation.id
          );

          if (existingIndex >= 0) {
            // Update existing conversation and move to top
            const newConversations = [...state.conversations];
            newConversations[existingIndex] = conversation;
            return {
              conversations: sortConversationsByLastMessage(newConversations),
            };
          } else {
            // Add new conversation at the top
            return {
              conversations: sortConversationsByLastMessage([
                conversation,
                ...state.conversations,
              ]),
            };
          }
        });
      },

      updateConversation: (conversationId, updates) => {
        set(state => {
          const updated = state.conversations.map(conv =>
            conv.id === conversationId ? { ...conv, ...updates } : conv
          );
          return { conversations: sortConversationsByLastMessage(updated) };
        });
      },

      removeConversation: conversationId => {
        set(state => ({
          conversations: state.conversations.filter(
            conv => conv.id !== conversationId
          ),
        }));
      },

      // Chat management
      setSelectedChat: chat => {
        set({ selectedChat: chat });
      },

      setMessages: messages => {
        // Always sort messages ASC (oldest first) when setting
        const sortedMessages = sortMessagesAsc(messages);
        set({ messages: sortedMessages });
      },

      addMessage: message => {
        set(state => {
          // 🔄 FIX: Prevent duplicate messages by ID (including temp messages)
          const existingMessage = state.messages.find(
            msg => msg.id === message.id || 
            (msg.id.startsWith('temp-') && msg.content === message.content && 
             msg.senderId === message.senderId && msg.receiverId === message.receiverId)
          );
          if (existingMessage && !message.id.startsWith('temp-')) {
            // If real message already exists, don't add duplicate
            return state;
          }

          // Add message and sort ASC
          const updatedMessages = sortMessagesAsc([...state.messages, message]);

          // Get the current user ID from auth store
          const currentUserId = useAuthStore.getState().user?.id;
          if (!currentUserId) return { messages: updatedMessages };

          // Find the conversation that needs to be updated
          const conversation = findConversationByUserId(
            state.conversations,
            message.senderId === currentUserId ? message.receiverId : message.senderId
          );

          if (!conversation) {
            // Conversation doesn't exist yet, will be created when fetching conversations
            return { messages: updatedMessages };
          }

          const isOwnMessage = message.senderId === currentUserId;
          const isSelectedChat = state.selectedChat?.id === conversation.user.id;

          // Update conversation
          const updatedConversation: ChatConversation = {
            ...conversation,
            lastMessage: message,
            updatedAt: message.createdAt,
            unreadCount:
              !isOwnMessage && !isSelectedChat
                ? conversation.unreadCount + 1
                : conversation.unreadCount,
          };

          // Update conversation and sort - this triggers UI update
          const updatedConversations = state.conversations.map(conv =>
            conv.id === conversation.id ? updatedConversation : conv
          );

          return {
            messages: updatedMessages,
            conversations: sortConversationsByLastMessage(updatedConversations),
          };
        });
      },

      updateMessage: (messageId, updates) => {
        set(state => ({
          messages: state.messages.map(msg =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ),
        }));
      },

      markMessageAsRead: messageId => {
        set(state => ({
          messages: state.messages.map(msg =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          ),
        }));
      },

      markConversationAsRead: conversationId => {
        set(state => {
          const conversation = state.conversations.find(
            conv => conv.id === conversationId
          );
          if (!conversation) return state;

          // Mark all messages in this conversation as read
          const currentUserId = useAuthStore.getState().user?.id;
          if (!currentUserId) return state;

          const updatedMessages = state.messages.map(msg => {
            const msgConversationId = getConversationId(
              msg.senderId === currentUserId ? msg.receiverId : msg.senderId,
              currentUserId
            );
            if (msgConversationId === conversationId && !msg.isRead) {
              return { ...msg, isRead: true };
            }
            return msg;
          });

          return {
            conversations: state.conversations.map(conv =>
              conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
            ),
            messages: updatedMessages,
          };
        });
      },

      // Connection management
      setConnectionStatus: isConnected => {
        set({ isConnected });
      },

      setLoading: isLoading => {
        set({ isLoading });
      },

      setError: error => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // WebSocket actions
      sendMessage: async data => {
        try {
          if (!data.content || !data.content.trim()) {
            throw new Error('Message cannot be empty');
          }

          const currentUserId = useAuthStore.getState().user?.id;
          if (!currentUserId) {
            throw new Error('User not authenticated');
          }

          const trimmedContent = data.content.trim();

          // 🔄 FIX: Create a temporary message for immediate UI update (optimistic update)
          const tempId = `temp-${Date.now()}-${Math.random()}`;
          const tempMessage: ChatMessage = {
            id: tempId,
            senderId: currentUserId,
            receiverId: data.receiverId,
            content: trimmedContent,
            isRead: false,
            createdAt: new Date(),
          };

          // Add message to UI immediately - this updates both messages and conversation list
          get().addMessage(tempMessage);

          // 🔄 FIX: Send via WebSocket if connected, otherwise use API
          if (wsService && wsService.getConnectionStatus()) {
            try {
              wsService.sendMessage({
                receiverId: data.receiverId,
                content: trimmedContent,
              });
              // WebSocket will emit 'messageSent' event with the real message
              // The onMessageSent handler will replace the temp message
            } catch (wsError) {
              // If WebSocket fails, fall back to API
              console.warn('WebSocket send failed, falling back to API:', wsError);
              const response = await chatService.sendMessage({
                receiverId: data.receiverId,
                content: trimmedContent,
              });

              const realMessage = response.message;
              if (realMessage) {
                // 🔄 FIX: Replace temp message with real one and update conversation
                set(state => {
                  // Remove temp message
                  const filteredMessages = state.messages.filter(msg => msg.id !== tempId);
                  const updatedMessages = sortMessagesAsc([...filteredMessages, realMessage]);
                  
                  // Update conversation with real message
                  const conversation = findConversationByUserId(
                    state.conversations,
                    data.receiverId
                  );
                  
                  let updatedConversations = state.conversations;
                  if (conversation) {
                    updatedConversations = state.conversations.map(conv =>
                      conv.id === conversation.id
                        ? {
                            ...conv,
                            lastMessage: realMessage,
                            updatedAt: realMessage.createdAt,
                          }
                        : conv
                    );
                  }
                  
                  return {
                    messages: updatedMessages,
                    conversations: sortConversationsByLastMessage(updatedConversations),
                  };
                });
              }
            }
          } else {
            // Fallback to API if WebSocket is not connected
            const response = await chatService.sendMessage({
              receiverId: data.receiverId,
              content: trimmedContent,
            });

            const realMessage = response.message;
            if (realMessage) {
              // 🔄 FIX: Replace temp message with real one and update conversation
              set(state => {
                // Remove temp message
                const filteredMessages = state.messages.filter(msg => msg.id !== tempId);
                const updatedMessages = sortMessagesAsc([...filteredMessages, realMessage]);
                
                // Update conversation with real message
                const conversation = findConversationByUserId(
                  state.conversations,
                  data.receiverId
                );
                
                let updatedConversations = state.conversations;
                if (conversation) {
                  updatedConversations = state.conversations.map(conv =>
                    conv.id === conversation.id
                      ? {
                          ...conv,
                          lastMessage: realMessage,
                          updatedAt: realMessage.createdAt,
                        }
                      : conv
                  );
                }
                
                return {
                  messages: updatedMessages,
                  conversations: sortConversationsByLastMessage(updatedConversations),
                };
              });
            }
          }
        } catch (error: any) {
          console.error('Failed to send message:', error);
          // 🔄 FIX: Remove temp message on error
          set(state => ({
            messages: state.messages.filter(msg => msg.id !== tempId),
          }));
          set({ error: error.message || 'Failed to send message' });
          throw error;
        }
      },

      connect: async () => {
        try {
          // Get token from auth store
          const authState = useAuthStore.getState();
          const token = authState.token;

          if (!token) {
            set({ isConnected: false });
            return;
          }

          // Create WebSocket service instance
          wsService = new WebSocketService(token);

          // Connect to WebSocket
          await wsService.connect();
          set({ isConnected: true });

          // 🔄 FIX: Set up event listeners with proper state updates
          wsService.onMessage(message => {
            const msg = message as ChatMessage;
            const state = get();
            const currentUserId = useAuthStore.getState().user?.id;

            if (!currentUserId) return;

            // Add message - this automatically updates conversation list
            get().addMessage(msg);
          });

          wsService.onMessageSent(message => {
            const msg = message as ChatMessage;
            set(state => {
              // 🔄 FIX: Find and replace temp message with real one
              const tempMessageIndex = state.messages.findIndex(
                m => m.id.startsWith('temp-') && 
                     m.content === msg.content && 
                     m.receiverId === msg.receiverId &&
                     m.senderId === msg.senderId
              );

              if (tempMessageIndex !== -1) {
                const updatedMessages = [...state.messages];
                updatedMessages[tempMessageIndex] = msg;
                
                // 🔄 FIX: Update conversation with real message
                const conversation = findConversationByUserId(
                  state.conversations,
                  msg.receiverId === currentUserId ? msg.senderId : msg.receiverId
                );
                
                let updatedConversations = state.conversations;
                if (conversation) {
                  updatedConversations = state.conversations.map(conv =>
                    conv.id === conversation.id
                      ? {
                          ...conv,
                          lastMessage: msg,
                          updatedAt: msg.createdAt,
                        }
                      : conv
                  );
                }
                
                return {
                  messages: sortMessagesAsc(updatedMessages),
                  conversations: sortConversationsByLastMessage(updatedConversations),
                };
              }

              // If no temp message found, check if message already exists
              const messageExists = state.messages.some(m => m.id === msg.id);
              if (!messageExists) {
                // Add new message and update conversation
                const updatedMessages = sortMessagesAsc([...state.messages, msg]);
                
                const conversation = findConversationByUserId(
                  state.conversations,
                  msg.receiverId === currentUserId ? msg.senderId : msg.receiverId
                );
                
                let updatedConversations = state.conversations;
                if (conversation) {
                  updatedConversations = state.conversations.map(conv =>
                    conv.id === conversation.id
                      ? {
                          ...conv,
                          lastMessage: msg,
                          updatedAt: msg.createdAt,
                        }
                      : conv
                  );
                }
                
                return {
                  messages: updatedMessages,
                  conversations: sortConversationsByLastMessage(updatedConversations),
                };
              }

              return state;
            });
          });

          wsService.onUserOnline(data => {
            set(state => ({
              conversations: state.conversations.map(conv =>
                conv.user.id === data.userId
                  ? { ...conv, user: { ...conv.user, isOnline: true } }
                  : conv
              ),
            }));
          });

          wsService.onUserOffline(data => {
            set(state => ({
              conversations: state.conversations.map(conv =>
                conv.user.id === data.userId
                  ? { ...conv, user: { ...conv.user, isOnline: false } }
                  : conv
              ),
            }));
          });

          wsService.onError(error => {
            console.error('WebSocket error:', error);
            set({ error: error.message || 'WebSocket error occurred' });
          });
        } catch (error: any) {
          console.error('Failed to connect to WebSocket:', error);
          set({ error: error.message || 'Failed to connect to WebSocket' });
          set({ isConnected: false });
        }
      },

      disconnect: () => {
        if (wsService) {
          wsService.disconnect();
          wsService = null;
        }
        set({ isConnected: false });
      },

      // Conversation management
      createConversation: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });

          const currentUserId = useAuthStore.getState().user?.id;
          if (!currentUserId) {
            throw new Error('User not authenticated');
          }

          // 🔄 FIX: Check if conversation already exists
          const existingConversation = findConversationByUserId(
            get().conversations,
            userId
          );

          if (existingConversation) {
            // 🔄 FIX: Refresh conversation list to ensure it's up to date
            await get().fetchConversations();
            const refreshed = findConversationByUserId(get().conversations, userId);
            return refreshed || existingConversation;
          }

          // Create conversation via API
          const response = await chatService.createConversation(userId);
          const newConversation = response.conversation;

          // 🔄 FIX: Add to conversations immediately - triggers UI update
          set(state => ({
            conversations: sortConversationsByLastMessage([
              newConversation,
              ...state.conversations,
            ]),
          }));

          // 🔄 FIX: Refresh conversations list to ensure sync with backend
          // This ensures any server-side updates are reflected
          setTimeout(async () => {
            try {
              await get().fetchConversations();
            } catch (error) {
              console.error('Failed to refresh conversations after creation:', error);
            }
          }, 100);

          return newConversation;
        } catch (error: any) {
          // If conversation already exists on backend, try to fetch it
          if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
            try {
              await get().fetchConversations();
              const existingConversation = findConversationByUserId(
                get().conversations,
                userId
              );
              if (existingConversation) {
                return existingConversation;
              }
            } catch (fetchError) {
              console.error('Failed to fetch conversations after duplicate error:', fetchError);
            }
          }
          set({ error: error.message || 'Failed to create conversation' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchConversations: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await chatService.getConversations();
          const sorted = sortConversationsByLastMessage(response.conversations);
          // 🔄 FIX: This set triggers UI update automatically via Zustand
          set({ conversations: sorted });
        } catch (error: any) {
          console.error('Error fetching conversations:', error);
          set({ error: error.message || 'Failed to fetch conversations' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      joinChatRoom: (conversationId: string) => {
        if (wsService && wsService.getConnectionStatus()) {
          wsService.joinChat(conversationId);
        }
      },

      leaveChatRoom: (conversationId: string) => {
        if (wsService && wsService.getConnectionStatus()) {
          wsService.leaveChat(conversationId);
        }
      },

      fetchMessages: async (conversationId: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await chatService.getMessages(conversationId, {
            limit: 50,
            offset: 0,
          });
          // 🔄 FIX: Messages are returned DESC from API, but we need ASC for display
          const sortedMessages = sortMessagesAsc(response.messages);
          // 🔄 FIX: This set triggers UI update automatically
          set({ messages: sortedMessages });
        } catch (error: any) {
          console.error('Error fetching messages:', error);
          set({ error: error.message || 'Failed to fetch messages' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Reset store
      reset: () => {
        set(initialState);
      },

      clearConversations: () => {
        set({ conversations: [] });
      },
    }),
    {
      name: 'chat-store',
      partialize: state => ({
        selectedChat: state.selectedChat,
      }),
    }
  )
);
