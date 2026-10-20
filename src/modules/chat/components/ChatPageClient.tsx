'use client';

import type { ChatConversation } from '@/modules/chat/types/chat.types';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ConversationList } from '@/modules/chat/components/ConversationList';
import { MessagePane } from '@/modules/chat/components/MessagePane';
import { NewConversationPicker } from '@/modules/chat/components/NewConversationPicker';
import { CONVERSATION_COPY } from '@/modules/chat/constants/conversation-copy';
import { useChat } from '@/modules/chat/hooks/use-chat';

export function ChatPageClient(props: {
  initialConversations: ChatConversation[];
  initialTargetUserId?: string;
}) {
  const router = useRouter();
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const handledTargetUserIdRef = useRef<string | null>(null);
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
  } = useChat(props.initialConversations, {
    autoSelectFirstConversation: false,
  });

  useEffect(() => {
    if (isUnauthorized) {
      router.replace('/');
    }
  }, [isUnauthorized, router]);

  useEffect(() => {
    if (!props.initialTargetUserId || isLoadingConversations) {
      return;
    }

    if (handledTargetUserIdRef.current === props.initialTargetUserId) {
      return;
    }

    handledTargetUserIdRef.current = props.initialTargetUserId;
    void startConversation(props.initialTargetUserId).then(() => {
      setIsChatWindowOpen(true);
    }).catch(() => {
      handledTargetUserIdRef.current = null;
    });
  }, [props.initialTargetUserId, isLoadingConversations, startConversation]);

  function openNewChat() {
    setIsNewChatOpen(true);
    setIsChatWindowOpen(false);
  }

  return (
    <div className="flex h-[calc(100dvh-5rem)] min-h-0 w-full flex-col overflow-hidden bg-[var(--surface-0)] sm:h-dvh">
      {error && !isLoadingConversations
        ? (
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--surface-1)] px-5 py-3 text-sm text-[var(--text-secondary)]" role="alert">
              <p>{error}</p>
              <button
                className="shrink-0 rounded-full px-3 py-1 font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2"
                type="button"
                onClick={() => void refreshConversations()}
              >
                {CONVERSATION_COPY.refresh}
              </button>
            </div>
          )
        : null}

      <div className="flex min-h-0 min-w-0 flex-1">
        <aside
          aria-label={CONVERSATION_COPY.title}
          className={`${isChatWindowOpen ? 'hidden md:flex' : 'flex'} min-h-0 w-full shrink-0 flex-col border-r border-[var(--border-subtle)] md:w-80 xl:w-[400px]`}
        >
          {isNewChatOpen
            ? (
                <NewConversationPicker
                  currentUserId={currentUser?.id}
                  onBack={() => setIsNewChatOpen(false)}
                  onStartConversation={async (userId) => {
                    await startConversation(userId);
                    setIsNewChatOpen(false);
                    setIsChatWindowOpen(true);
                  }}
                />
              )
            : (
                <ConversationList
                  conversations={conversations}
                  isLoading={isLoadingConversations}
                  selectedConversationId={selectedConversation?.id ?? null}
                  onNewChat={openNewChat}
                  onSelect={(conversationId) => {
                    selectConversation(conversationId);
                    setIsChatWindowOpen(true);
                  }}
                />
              )}
        </aside>

        <MessagePane
          isChatWindowOpen={isChatWindowOpen}
          conversation={selectedConversation}
          currentUser={currentUser}
          hasOlderMessages={hasOlderMessages}
          isFetchingOlderMessages={isFetchingOlderMessages}
          isLoading={isLoadingMessages}
          loadOlderMessages={loadOlderMessages}
          messages={messages}
          onBackToChatList={() => setIsChatWindowOpen(false)}
          onNewChat={openNewChat}
          onRetryMessage={retryMessage}
          onSendMessage={sendMessage}
          showBackButton
        />
      </div>
    </div>
  );
}
