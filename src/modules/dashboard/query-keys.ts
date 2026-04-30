export const dashboardKeys = {
  all: ['dashboard'] as const,
  posts: () => ['dashboard', 'posts'] as const,
  postCreationJourneys: () => ['dashboard', 'post-creation-journeys'] as const,
};

export const dashboardQueryKeys = {
  all: dashboardKeys.all,
  feed: () => dashboardKeys.posts(),
  postCreationJourneys: () => dashboardKeys.postCreationJourneys(),
};
