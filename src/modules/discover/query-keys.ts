export const discoverQueryKeys = {
  all: ['discover'] as const,
  journeys: () => ['discover', 'journeys'] as const,
};
