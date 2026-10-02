export const notificationQueryKeys = {
  all: ['notifications'] as const,
  browserConfiguration: () =>
    [...notificationQueryKeys.all, 'browser-configuration'] as const,
  list: () => [...notificationQueryKeys.all, 'list'] as const,
  preferences: () =>
    [...notificationQueryKeys.all, 'preferences'] as const,
};
