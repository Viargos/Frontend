'use client';

import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import type { AuthUser } from '@/modules/auth';
import type {
  DashboardCreatePostRequestDto,
  DashboardCreatePostResponseDto,
} from '@/modules/dashboard/dto/dashboard.dto';
import type {
  DashboardFeedModel,
  DashboardPost,
  DashboardPostCreationJourneyOption,
} from '@/modules/dashboard/types/dashboard.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { appConfig } from '@/lib/app-config';
import { mapCreatePostToDashboardPost } from '@/modules/dashboard/mappers/dashboard.mapper';
import { dashboardKeys } from '@/modules/dashboard/query-keys';
import { dashboardService } from '@/modules/dashboard/services/dashboard.service';

type DashboardInfiniteData = InfiniteData<DashboardFeedModel, string | undefined>;

type CreatePostInput = DashboardCreatePostRequestDto & {
  journeyTitle?: string;
  mediaFiles: File[];
  mediaPreviewUrls: string[];
};

type OptimisticCreatePostVariables = CreatePostInput & {
  optimisticPostId: string;
};

type CachedDashboardPostsEntry = {
  data: DashboardInfiniteData | undefined;
  queryKey: QueryKey;
};

type CreatePostMutationContext = {
  optimisticPostId: string;
  previousEntries: CachedDashboardPostsEntry[];
};

type UseCreatePostOptions = {
  user: AuthUser | null;
};

function isDashboardPostsKey(queryKey: QueryKey): boolean {
  return queryKey[0] === 'dashboard' && queryKey[1] === 'posts';
}

function captureDashboardPostEntries(
  queryClient: ReturnType<typeof useQueryClient>,
): CachedDashboardPostsEntry[] {
  return queryClient
    .getQueriesData<DashboardInfiniteData>({ queryKey: dashboardKeys.all })
    .filter(([queryKey]) => isDashboardPostsKey(queryKey))
    .map(([queryKey, data]) => ({
      data,
      queryKey,
    }));
}

function restoreDashboardPostEntries(
  queryClient: ReturnType<typeof useQueryClient>,
  entries: CachedDashboardPostsEntry[],
) {
  for (const entry of entries) {
    queryClient.setQueryData(entry.queryKey, entry.data);
  }
}

function prependPostToInfiniteData(
  data: DashboardInfiniteData | undefined,
  post: DashboardPost,
): DashboardInfiniteData | undefined {
  if (!data || data.pages.length === 0) {
    return {
      pageParams: [undefined],
      pages: [{
        hasMore: false,
        posts: [post],
        totalCount: 1,
      }],
    };
  }

  const firstPage = data.pages[0];
  if (!firstPage) {
    return data;
  }

  const restPages = data.pages.slice(1);

  return {
    ...data,
    pages: [
      {
        ...firstPage,
        posts: [post, ...firstPage.posts],
        totalCount: typeof firstPage.totalCount === 'number' ? firstPage.totalCount + 1 : firstPage.totalCount,
      },
      ...restPages,
    ],
  };
}

function replacePostInInfiniteData(
  data: DashboardInfiniteData | undefined,
  optimisticPostId: string,
  post: DashboardPost,
): DashboardInfiniteData | undefined {
  if (!data) {
    return data;
  }

  let hasChanges = false;
  const nextPages = data.pages.map((page) => {
    let pageChanged = false;
    const nextPosts = page.posts.map((existingPost) => {
      if (existingPost.id !== optimisticPostId) {
        return existingPost;
      }

      pageChanged = true;
      return post;
    });

    if (!pageChanged) {
      return page;
    }

    hasChanges = true;
    return {
      ...page,
      posts: nextPosts,
    };
  });

  if (!hasChanges) {
    return data;
  }

  return {
    ...data,
    pages: nextPages,
  };
}

function createOptimisticPost(
  variables: OptimisticCreatePostVariables,
  user: AuthUser,
): DashboardPost {
  const media = variables.mediaPreviewUrls.map((url, index) => ({
    id: `${variables.optimisticPostId}-media-${index}`,
    kind: 'image' as const,
    url,
  }));

  return {
    commentCount: 0,
    comments: [],
    createdAt: new Date().toISOString(),
    description: variables.description,
    id: variables.optimisticPostId,
    isLikedByCurrentUser: false,
    journey: variables.journeyId && variables.journeyTitle
      ? {
          id: variables.journeyId,
          title: variables.journeyTitle,
        }
      : undefined,
    likeCount: 0,
    location: variables.location,
    media,
    user: {
      id: user.id,
      profileImage: user.profileImage ?? undefined,
      username: user.username,
    },
  };
}

async function uploadPostMedia(postId: string, files: File[]): Promise<DashboardPost['media']> {
  const media: DashboardPost['media'] = [];

  for (const [index, file] of files.entries()) {
    const uploaded = await dashboardService.uploadPostMedia(file);
    await dashboardService.addPostMedia(postId, {
      order: index,
      type: 'image',
      url: uploaded.imageUrl,
    });

    media.push({
      id: `${postId}-media-${index}`,
      kind: 'image',
      url: uploaded.imageUrl,
    });
  }

  return media;
}

function createOptimisticPostId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `optimistic-post-${crypto.randomUUID()}`;
  }

  return `optimistic-post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function updateAllDashboardPostQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (data: DashboardInfiniteData | undefined) => DashboardInfiniteData | undefined,
) {
  const entries = captureDashboardPostEntries(queryClient);

  for (const entry of entries) {
    queryClient.setQueryData<DashboardInfiniteData>(entry.queryKey, updater);
  }
}

export function useCreatePost(options: UseCreatePostOptions) {
  const { user } = options;
  const queryClient = useQueryClient();
  const inFlightRef = useRef(false);

  const mutation = useMutation<
    DashboardPost,
    Error,
    OptimisticCreatePostVariables,
    CreatePostMutationContext
  >({
    mutationFn: async (variables): Promise<DashboardPost> => {
      const response: DashboardCreatePostResponseDto = await dashboardService.createPost({
        description: variables.description,
        journeyId: variables.journeyId,
        latitude: variables.latitude,
        location: variables.location,
        longitude: variables.longitude,
      });

      const media = variables.mediaFiles.length > 0
        ? await uploadPostMedia(response.id, variables.mediaFiles)
        : [];

      const fallbackUser = {
        id: user?.id ?? response.user?.id ?? 'unknown-user',
        profileImage: user?.profileImage ?? response.user?.profileImage ?? undefined,
        username: user?.username ?? response.user?.username ?? 'unknown',
      };

      return mapCreatePostToDashboardPost(response, {
        media,
        user: fallbackUser,
      });
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      restoreDashboardPostEntries(queryClient, context.previousEntries);
    },
    onMutate: async (variables): Promise<CreatePostMutationContext> => {
      if (!user) {
        throw new Error('You must be signed in to create a post.');
      }

      await queryClient.cancelQueries({ queryKey: dashboardKeys.all });
      const previousEntries = captureDashboardPostEntries(queryClient);
      const optimisticPost = createOptimisticPost(variables, user);

      updateAllDashboardPostQueries(queryClient, previous => prependPostToInfiniteData(previous, optimisticPost));

      return {
        optimisticPostId: variables.optimisticPostId,
        previousEntries,
      };
    },
    onSuccess: (createdPost, _variables, context) => {
      if (!context) {
        return;
      }

      updateAllDashboardPostQueries(
        queryClient,
        previous => replacePostInInfiniteData(previous, context.optimisticPostId, createdPost),
      );
    },
  });

  const createPost = useCallback(async (input: CreatePostInput) => {
    if (inFlightRef.current || mutation.isPending) {
      return;
    }

    inFlightRef.current = true;

    try {
      await mutation.mutateAsync({
        ...input,
        optimisticPostId: createOptimisticPostId(),
      });
    } finally {
      inFlightRef.current = false;
    }
  }, [mutation]);

  return {
    createPost,
    createPostError: mutation.error instanceof Error ? mutation.error.message : null,
    isCreatingPost: mutation.isPending,
  };
}

export function usePostCreationJourneys(enabled: boolean) {
  const journeysQuery = useQuery<DashboardPostCreationJourneyOption[]>({
    enabled,
    queryFn: () => dashboardService.listJourneysForPostCreation(),
    queryKey: dashboardKeys.postCreationJourneys(),
    staleTime: appConfig.reactQuery.staleTimeMs,
  });

  return {
    journeyError: journeysQuery.error instanceof Error ? journeysQuery.error.message : null,
    journeys: journeysQuery.data ?? [],
    refreshJourneys: journeysQuery.refetch,
    isLoadingJourneys: journeysQuery.isLoading,
  };
}
