'use client';

import type { ChatConversation } from '@/modules/chat/types/chat.types';
import * as motion from 'framer-motion/client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ConversationList } from '@/modules/chat/components/ConversationList';
import { MessagePane } from '@/modules/chat/components/MessagePane';
import { useChat } from '@/modules/chat/hooks/use-chat';
import { ChatBubbleIcon } from '@/modules/common/icons';

type ChatPageClientProps = {
  disableAutoSelect?: boolean;
  initialConversations: ChatConversation[];
  initialTargetUserId?: string;
};

function subscribeToViewport(callback: () => void): () => void {
  const mediaQuery = window.matchMedia('(min-width: 768px)');
  mediaQuery.addEventListener('change', callback);
  return () => {
    mediaQuery.removeEventListener('change', callback);
  };
}

function getClientViewportSnapshot(): boolean {
  return window.matchMedia('(min-width: 768px)').matches;
}

function getServerViewportSnapshot(): boolean {
  return false;
}

export const ChatPageClient = (props: ChatPageClientProps) => {
  const { disableAutoSelect = false, initialConversations, initialTargetUserId } = props;
  const router = useRouter();
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const handledTargetUserIdRef = useRef<string | null>(null);
  const isDesktop = useSyncExternalStore(
    subscribeToViewport,
    getClientViewportSnapshot,
    getServerViewportSnapshot,
  );
  const {
    conversations,
    currentUser,
    error,
    hasOlderMessages,
    isFetchingOlderMessages,
    isLoadingConversations,
    isLoadingMessages,
    isUnauthorized,
    loadOlderMessages,
    messages,
    refreshConversations,
    retryMessage,
    selectedConversation,
    selectConversation,
    sendMessage,
    startConversation,
  } = useChat(initialConversations, {
    autoSelectFirstConversation: isDesktop && !disableAutoSelect,
  });

  useEffect(() => {
    if (!isUnauthorized) {
      return;
    }

    router.replace('/');
  }, [isUnauthorized, router]);

  useEffect(() => {
    if (!initialTargetUserId || isLoadingConversations) {
      return;
    }

    if (handledTargetUserIdRef.current === initialTargetUserId) {
      return;
    }

    handledTargetUserIdRef.current = initialTargetUserId;

    void startConversation(initialTargetUserId).then(() => {
      setIsChatWindowOpen(true);
    }).catch(() => {
      handledTargetUserIdRef.current = null;
    });
  }, [initialTargetUserId, isLoadingConversations, startConversation]);

  const handleChatSelect = useCallback((conversationId: string) => {
    selectConversation(conversationId);
    setIsChatWindowOpen(true);
  }, [selectConversation]);

  const handleBackToChatList = useCallback(() => {
    setIsChatWindowOpen(false);
  }, []);

  const showConversationBootstrapEmpty = conversations.length === 0 && !isLoadingConversations && !error;

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col overflow-hidden sm:h-[calc(100vh-4rem)]">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8"
        initial={{ opacity: 0, y: 20 }}
      >
        <div className="mx-auto h-full max-w-7xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {error && !isLoadingConversations
            ? (
                <div className="flex h-full items-center justify-center p-6">
                  <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-5 text-center">
                    <p className="text-sm text-red-700">{error}</p>
                    <button
                      className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      type="button"
                      onClick={() => void refreshConversations()}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )
            : showConversationBootstrapEmpty
              ? (
                  <div className="flex h-full items-center justify-center p-8">
                    <div className="max-w-md text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <ChatBubbleIcon className="h-8 w-8" />
                      </div>
                      <h2 className="mb-2 text-2xl font-bold text-gray-900">Start your first conversation</h2>
                      <p className="text-gray-600">
                        Connect with travelers, share experiences, and plan your next adventure together.
                      </p>
                    </div>
                  </div>
                )
              : (
                  <div className="flex h-full">
                    <div
                      className={`${
                        isChatWindowOpen ? 'hidden md:flex' : 'flex'
                      } w-full flex-col border-r border-gray-200 md:w-96`}
                    >
                      <ConversationList
                        conversations={conversations}
                        isLoading={isLoadingConversations}
                        selectedConversationId={selectedConversation?.id ?? null}
                        onSelect={handleChatSelect}
                      />
                    </div>

                    <MessagePane
                      isChatWindowOpen={isChatWindowOpen}
                      conversation={selectedConversation}
                      currentUser={currentUser}
                      hasOlderMessages={hasOlderMessages}
                      isFetchingOlderMessages={isFetchingOlderMessages}
                      isLoading={isLoadingMessages}
                      loadOlderMessages={loadOlderMessages}
                      messages={messages}
                      onBackToChatList={handleBackToChatList}
                      onRetryMessage={retryMessage}
                      onSendMessage={sendMessage}
                      showBackButton={true}
                    />
                  </div>
                )}
        </div>
      </motion.div>
    </div>
  );
};
