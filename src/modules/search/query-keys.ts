export const searchKeys = {
  all: ['search'] as const,
  users: (query: string) => ['search', 'users', query] as const,
};
