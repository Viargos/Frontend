'use client';

import { ArrowLeft, LoaderCircle, MessageCircle, Search } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { NEW_CONVERSATION_COPY as copy } from '@/modules/chat/constants/new-conversation-copy';
import { useNewConversation } from '@/modules/chat/hooks/use-new-conversation';

export function NewConversationPicker(props: {
  currentUserId?: string;
  onBack: () => void;
  onStartConversation: (userId: string) => Promise<void>;
}) {
  const { isSearching, people, peopleQuery, searchQuery, setSearchQuery, startConversation } = useNewConversation({
    currentUserId: props.currentUserId,
    onStartConversation: props.onStartConversation,
  });
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  return (
    <section className="flex h-full min-h-0 flex-col bg-[var(--surface-0)]" aria-labelledby="new-chat-title">
      <div className="shrink-0 border-b border-[var(--border-subtle)] px-4 pt-3 pb-4">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            aria-label={copy.back}
            disabled={startConversation.isPending}
            onClick={props.onBack}
            className="-ml-2 flex size-9 items-center justify-center rounded-full text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <h2 id="new-chat-title" className="text-xl font-bold text-[var(--text-primary)]">{copy.title}</h2>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            aria-label={copy.searchLabel}
            placeholder={copy.searchPlaceholder}
            value={searchQuery}
            disabled={startConversation.isPending}
            onChange={event => setSearchQuery(event.target.value)}
            className="h-11 w-full rounded-full border border-transparent bg-[var(--surface-2)] pr-4 pl-11 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--text-muted)] disabled:opacity-50"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-2" aria-busy={isSearching || startConversation.isPending}>
        {startConversation.isError && (
          <p role="alert" className="px-5 py-3 text-sm text-[var(--text-secondary)]">{copy.startError}</p>
        )}
        {isSearching
          ? (
              <p role="status" className="flex items-center justify-center gap-2 px-5 py-8 text-sm text-[var(--text-muted)]">
                <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" />
                {copy.searching}
              </p>
            )
          : peopleQuery.isError
            ? (
                <div className="px-5 py-8 text-center">
                  <p role="alert" className="text-sm text-[var(--text-secondary)]">{copy.loadError}</p>
                  <button
                    type="button"
                    onClick={() => void peopleQuery.refetch()}
                    disabled={peopleQuery.isFetching || startConversation.isPending}
                    className="mt-3 rounded-full px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
                  >
                    {copy.refresh}
                  </button>
                </div>
              )
            : people.length === 0
              ? (
                  <div role="status" className="px-6 py-10 text-center">
                    <p className="font-semibold text-[var(--text-primary)]">{copy.emptyTitle}</p>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">{copy.emptyDescription}</p>
                  </div>
                )
              : (
                  <ul>
                    {people.map(person => (
                      <li key={person.id}>
                        <button
                          type="button"
                          disabled={startConversation.isPending}
                          onClick={() => startConversation.mutate(person.id)}
                          className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-[var(--surface-1)] focus-visible:bg-[var(--surface-2)] focus-visible:outline-none disabled:opacity-50"
                        >
                          <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-2)] text-base font-semibold text-[var(--text-primary)]">
                            {person.profileImage
                              ? <Image src={person.profileImage} alt="" fill sizes="48px" className="object-cover" />
                              : person.username.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--text-primary)]">{person.username}</span>
                          {startConversation.isPending && startConversation.variables === person.id
                            ? <LoaderCircle className="size-4 shrink-0 text-[var(--text-muted)] motion-safe:animate-spin" aria-label={copy.starting} />
                            : <MessageCircle className="size-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
      </div>
    </section>
  );
}
