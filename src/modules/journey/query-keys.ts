export const journeyQueryKeys = {
  all: ['journey'] as const,
  detail: (journeyId: string) => ['journey', 'detail', journeyId] as const,
  list: () => ['journey', 'list'] as const,
};
