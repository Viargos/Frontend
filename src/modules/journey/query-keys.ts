export const journeyQueryKeys = {
  all: ['journey'] as const,
  detail: (journeyId: string) => ['journey', 'detail', journeyId] as const,
  list: () => ['journey', 'list'] as const,
  posts: (journeyId: string) => ['journey', 'detail', journeyId, 'posts'] as const,
};
