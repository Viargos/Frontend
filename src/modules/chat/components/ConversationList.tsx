'use client';

import type { ChatConversation } from '@/modules/chat/types/chat.types';
import { ChevronDown, MessageCirclePlus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { ConversationItem } from '@/modules/chat/components/ConversationItem';
import { CONVERSATION_COPY } from '@/modules/chat/constants/conversation-copy';

export function ConversationList(props: {
  conversations: ChatConversation[];
  isLoading: boolean;
  onNewChat: () => void;
  onSelect: (conversationId: string) => void;
  selectedConversationId: string | null;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const query = searchQuery.trim().toLowerCase();
  const filteredConversations = props.conversations.filter(conversation => (
    (!showUnreadOnly || conversation.unreadCount > 0)
    && conversation.user.username.toLowerCase().includes(query)
  ));
  const emptyTitle = query
    ? CONVERSATION_COPY.noResults
    : showUnreadOnly ? CONVERSATION_COPY.noUnread : CONVERSATION_COPY.emptyTitle;
  const emptyDescription = query
    ? CONVERSATION_COPY.noResultsDescription
    : showUnreadOnly ? CONVERSATION_COPY.noUnreadDescription : CONVERSATION_COPY.emptyDescription;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 px-5 pt-4 pb-3">
        <div className="flex h-9 items-center justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">{CONVERSATION_COPY.title}</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                aria-label={CONVERSATION_COPY.filter}
                className="h-9 appearance-none rounded-full border border-[var(--border-subtle)] bg-[var(--surface-0)] pr-8 pl-4 text-sm font-medium text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2"
                value={showUnreadOnly ? 'unread' : 'all'}
                onChange={event => setShowUnreadOnly(event.target.value === 'unread')}
              >
                <option value="all">{CONVERSATION_COPY.all}</option>
                <option value="unread">{CONVERSATION_COPY.unread}</option>
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-2.5 right-3 size-4 text-[var(--text-secondary)]" />
            </div>
            <button
              aria-label={CONVERSATION_COPY.newChat}
              className="flex size-9 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-3)] focus-visible:outline-2 focus-visible:outline-offset-2"
              type="button"
              onClick={props.onNewChat}
            >
              <MessageCirclePlus aria-hidden="true" className="size-5" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div className="relative mt-4">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            aria-label={CONVERSATION_COPY.search}
            className="h-11 w-full rounded-full border border-transparent bg-[var(--surface-2)] pr-10 pl-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-muted)] focus:outline-none"
            placeholder={CONVERSATION_COPY.search}
            type="text"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
          />
          {searchQuery
            ? (
                <button
                  aria-label={CONVERSATION_COPY.clearSearch}
                  className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-3)] focus-visible:outline-2"
                  type="button"
                  onClick={() => setSearchQuery('')}
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              )
            : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2">
        {props.isLoading && props.conversations.length === 0
          ? (
              <div aria-busy="true" className="space-y-1">
                {[1, 2, 3, 4, 5].map(index => (
                  <div key={index} className="flex items-center gap-3 px-3 py-3">
                    <div className="size-12 shrink-0 rounded-full bg-[var(--surface-2)] motion-safe:animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 rounded bg-[var(--surface-2)] motion-safe:animate-pulse" />
                      <div className="h-3 w-full rounded bg-[var(--surface-2)] motion-safe:animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            )
          : filteredConversations.length === 0
            ? (
                <div className="px-5 py-12">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">{emptyTitle}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{emptyDescription}</p>
                  {!query && !showUnreadOnly
                    ? (
                        <button
                          className="mt-5 rounded-full bg-[var(--surface-inverse)] px-5 py-2.5 text-sm font-semibold text-[var(--text-inverse)] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
                          type="button"
                          onClick={props.onNewChat}
                        >
                          {CONVERSATION_COPY.newChat}
                        </button>
                      )
                    : null}
                </div>
              )
            : (
                <div className="space-y-1">
                  {filteredConversations.map(conversation => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isActive={props.selectedConversationId === conversation.id}
                      onClick={() => props.onSelect(conversation.id)}
                    />
                  ))}
                </div>
              )}
      </div>
    </div>
  );
}
