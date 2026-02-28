import { Skeleton } from '@/modules/common';

export function ChatSkeleton() {
  return (
    <div aria-busy="true" className="flex h-[calc(100vh-9rem)] flex-col overflow-hidden sm:h-[calc(100vh-4rem)]" role="status">
      <div className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex h-full max-w-7xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex w-full flex-col border-r border-gray-200 md:w-96">
            <div className="flex-shrink-0 border-b border-gray-100 bg-[#160E53] p-5">
              <Skeleton className="h-6 w-28 bg-white/30" />
              <Skeleton className="mt-4 h-10 w-full rounded-xl bg-white/90" />
            </div>
            <div className="flex-1 space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3" key={`chat-conversation-skeleton-${index + 1}`}>
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden min-w-0 flex-1 flex-col md:flex">
            <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>

            <div className="flex-1 space-y-4 overflow-hidden bg-gray-50 p-4">
              {Array.from({ length: 8 }).map((_, index) => {
                const isOwn = index % 2 === 0;

                return (
                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`} key={`chat-message-skeleton-${index + 1}`}>
                    <Skeleton className={`h-10 rounded-2xl ${isOwn ? 'w-40' : 'w-52'}`} />
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 bg-white p-3">
              <div className="flex items-center gap-2 rounded-full border-2 border-gray-200 p-2">
                <Skeleton className="h-9 flex-1 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
