export const profileQueryKeys = {
  all: ['profile'] as const,
  current: () => ['profile', 'current'] as const,
  detail: (userId: string) => ['profile', 'detail', userId] as const,
  postComments: (postId: string) => ['profile', 'post-comments', postId] as const,
};
