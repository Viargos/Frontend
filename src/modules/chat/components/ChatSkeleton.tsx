import { CHAT_COPY } from '@/modules/chat/constants/chat-copy';
import { Skeleton } from '@/modules/common';

export function ChatSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label={CHAT_COPY.loadingConversations}
      className="flex h-[calc(100dvh-5rem)] min-h-0 overflow-hidden bg-[var(--surface-0)] sm:h-dvh motion-reduce:[&_*]:animate-none"
      role="status"
    >
      <div className="flex min-h-0 w-full shrink-0 flex-col border-r border-[var(--border-subtle)] md:w-80 xl:w-[400px]">
        <div className="shrink-0 px-5 pt-5 pb-4">
          <div className="flex h-8 items-center justify-between">
            <Skeleton className="h-6 w-20 bg-[var(--surface-2)]" />
            <Skeleton className="size-8 rounded-full bg-[var(--surface-2)]" />
          </div>
          <Skeleton className="mt-5 h-10 w-full rounded-full bg-[var(--surface-2)]" />
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-hidden px-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="flex items-center gap-3 px-3 py-3.5" key={`chat-conversation-skeleton-${index + 1}`}>
              <Skeleton className="size-12 shrink-0 rounded-full bg-[var(--surface-2)]" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-2/3 bg-[var(--surface-2)]" />
                <Skeleton className="h-3 w-5/6 bg-[var(--surface-2)]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden min-h-0 min-w-0 flex-1 flex-col md:flex">
        <div className="flex h-[73px] shrink-0 items-center gap-3 border-b border-[var(--border-subtle)] px-6">
          <Skeleton className="size-10 rounded-full bg-[var(--surface-2)]" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24 bg-[var(--surface-2)]" />
            <Skeleton className="h-3 w-16 bg-[var(--surface-2)]" />
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-hidden p-6">
          {Array.from({ length: 6 }).map((_, index) => {
            const isOwn = index % 2 === 0;

            return (
              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`} key={`chat-message-skeleton-${index + 1}`}>
                <Skeleton className={`h-12 max-w-[75%] rounded-2xl bg-[var(--surface-2)] ${isOwn ? 'w-40' : 'w-52'}`} />
              </div>
            );
          })}
        </div>

        <div className="shrink-0 border-t border-[var(--border-subtle)] px-6 py-3">
          <Skeleton className="h-[54px] w-full rounded-full bg-[var(--surface-2)]" />
          <Skeleton className="mx-auto mt-2 h-2.5 w-48 bg-[var(--surface-2)]" />
        </div>
      </div>
    </div>
  );
}
