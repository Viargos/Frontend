export const settingsQueryKeys = {
  all: ['settings'] as const,
  preferences: () => ['settings', 'preferences'] as const,
};
