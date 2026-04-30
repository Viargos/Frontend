export const chatQueryKeys = {
  all: ['chat'] as const,
  conversation: (conversationId: string) => ['chat', 'conversation', conversationId] as const,
  conversations: () => ['chat', 'conversations'] as const,
  currentUser: () => ['chat', 'current-user'] as const,
  list: () => ['chat', 'conversations'] as const,
  messages: (conversationId: string) => ['chat', 'messages', conversationId] as const,
};
