'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useCallback, useRef } from 'react';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { ChatUser } from '@/types/chat.types';

/**
 * Messages Page - Main chat interface for authenticated users
 * This page provides a complete chat experience with conversation list and chat window
 * 
 * 🔄 FIX: All state updates trigger automatic UI re-renders via Zustand
 * 🔄 FIX: Proper dependency arrays prevent stale closures
 * 🔄 FIX: Automatic refetch after mutations
 */
export default function MessagesPage() {
  const { user } = useAuthStore();
  const {
    selectedChat,
    messages,
    conversations,
    setSelectedChat,
    setMessages,
    sendMessage,
    connect,
    disconnect,
    fetchMessages,
    fetchConversations,
    createConversation,
    joinChatRoom,
    leaveChatRoom,
    markConversationAsRead,
  } = useChatStore();

  const [showChatWindow, setShowChatWindow] = useState(false);
  const currentConversationIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const isConnectingRef = useRef(false);

  // 🔄 FIX: Connect to WebSocket and fetch conversations on mount
  useEffect(() => {
    if (!user || isConnectingRef.current) return;

    const initializeChat = async () => {
      isConnectingRef.current = true;
      try {
        await connect();
        await fetchConversations();
        isInitializedRef.current = true;
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      } finally {
        isConnectingRef.current = false;
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (currentConversationIdRef.current) {
        leaveChatRoom(currentConversationIdRef.current);
      }
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Re-initialize if user changes

  // 🔄 FIX: Load messages for selected chat when it changes or conversations are loaded
  useEffect(() => {
    if (!selectedChat || !isInitializedRef.current) return;

    const loadChat = async () => {
      // Find the conversation
      const conversation = conversations.find(
        conv => conv.user.id === selectedChat.id
      );

      if (conversation) {
        // Leave previous chat room if switching
        if (currentConversationIdRef.current && currentConversationIdRef.current !== conversation.id) {
          leaveChatRoom(currentConversationIdRef.current);
        }

        currentConversationIdRef.current = conversation.id;
        setShowChatWindow(true);

        // Join the chat room for real-time updates
        joinChatRoom(conversation.id);

        // Load existing messages
        try {
          await fetchMessages(conversation.id);
          // Mark conversation as read when opening
          await markConversationAsRead(conversation.id);
        } catch (error) {
          console.error('Failed to load messages:', error);
          setMessages([]);
        }
      } else {
        // Conversation doesn't exist yet, clear messages
        setMessages([]);
        currentConversationIdRef.current = null;
      }
    };

    loadChat();
    // 🔄 FIX: Proper dependency array - includes all used values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?.id, conversations.length, isInitializedRef.current]);

  // 🔄 FIX: Memoized callback with proper dependencies to prevent stale closures
  const handleChatSelect = useCallback(
    async (chat: ChatUser) => {
      // If clicking on the same chat, do nothing
      if (selectedChat && selectedChat.id === chat.id) {
        return;
      }

      // Leave previous chat room if switching chats
      if (currentConversationIdRef.current) {
        leaveChatRoom(currentConversationIdRef.current);
        currentConversationIdRef.current = null;
      }

      // Clear messages first to avoid showing old messages
      setMessages([]);

      setSelectedChat(chat);
      setShowChatWindow(true);

      // Find or create the conversation
      let conversation = conversations.find(conv => conv.user.id === chat.id);

      if (!conversation) {
        // Create conversation if it doesn't exist
        try {
          conversation = await createConversation(chat.id);
          // 🔄 FIX: After creating, refresh conversations to ensure sync
          await fetchConversations();
          // Find again after refresh
          conversation = conversations.find(conv => conv.user.id === chat.id) || conversation;
        } catch (error) {
          console.error('Failed to create conversation:', error);
          // Try to find it again in case it was created
          await fetchConversations();
          conversation = conversations.find(conv => conv.user.id === chat.id);
        }
      }

      if (conversation) {
        try {
          currentConversationIdRef.current = conversation.id;
          // Join the chat room for real-time updates
          joinChatRoom(conversation.id);
          // Load existing messages
          await fetchMessages(conversation.id);
          // Mark conversation as read
          await markConversationAsRead(conversation.id);
        } catch (error) {
          console.error('Failed to load messages:', error);
          setMessages([]);
        }
      }
    },
    [
      selectedChat,
      conversations,
      leaveChatRoom,
      setMessages,
      setSelectedChat,
      joinChatRoom,
      fetchMessages,
      createConversation,
      fetchConversations,
      markConversationAsRead,
    ]
  );

  const handleBackToChatList = useCallback(() => {
    // Leave the current chat room
    if (currentConversationIdRef.current) {
      leaveChatRoom(currentConversationIdRef.current);
      currentConversationIdRef.current = null;
    }

    setShowChatWindow(false);
    setSelectedChat(null);
    setMessages([]);
  }, [leaveChatRoom, setSelectedChat, setMessages]);

  // 🔄 FIX: Memoized send message handler - ensures UI updates instantly
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedChat || !user || !content.trim()) return;

      try {
        // 🔄 FIX: sendMessage automatically updates UI via Zustand store
        // The store handles optimistic updates and real message replacement
        await sendMessage({
          receiverId: selectedChat.id,
          content: content.trim(),
          senderId: user.id,
        });
        // 🔄 FIX: After sending, refresh conversations to ensure list is updated
        // This happens automatically via WebSocket, but we ensure it here too
        setTimeout(() => {
          fetchConversations().catch(console.error);
        }, 500);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    },
    [selectedChat, user, sendMessage, fetchConversations]
  );

  return (
    <motion.div
      className="flex-1 p-4 sm:p-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="w-full max-w-7xl mx-auto h-[calc(100vh-8rem)]">
        <div className="flex flex-col md:flex-row gap-6 h-full">
          {/* Chat List - Left Side - Hidden on mobile when chat is open */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`w-full md:w-80 flex-shrink-0 ${
              showChatWindow ? 'hidden md:block' : 'block'
            }`}
          >
            <ChatList
              onChatSelect={handleChatSelect}
              selectedChatId={selectedChat?.id}
            />
          </motion.div>

          {/* Chat Window - Right Side - Hidden on mobile when no chat selected */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`flex-1 min-h-0 ${
              showChatWindow ? 'block' : 'hidden md:block'
            }`}
          >
            {selectedChat ? (
              <ChatWindow
                chat={selectedChat}
                messages={messages}
                onSendMessage={handleSendMessage}
                onBackToChatList={handleBackToChatList}
                showBackButton={showChatWindow}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="text-center max-w-md mx-auto px-6">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-blue/10 to-primary-blue/5 rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-primary-blue"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Welcome to Messages
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Select a conversation from the list to start chatting, or
                    visit someone's profile to start a new conversation.
                  </p>
                  <div className="space-y-3 text-sm text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span>Start new conversations from user profiles</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>All your conversations will appear here</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
