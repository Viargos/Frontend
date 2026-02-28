'use client';

import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import type {
  DashboardAddCommentRequestDto,
  DashboardCommentDto,
  DashboardLikeResponseDto,
} from '@/modules/dashboard/dto/dashboard.dto';
import type { DashboardFeedModel, DashboardPost, DashboardPostComment } from '@/modules/dashboard/types/dashboard.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { dashboardKeys } from '@/modules/dashboard/query-keys';
import { dashboardService } from '@/modules/dashboard/services/dashboard.service';

type DashboardInfiniteData = InfiniteData<DashboardFeedModel, string | undefined>;

type ToggleLikeMutationVariables = {
  isCurrentlyLiked: boolean;
  postId: string;
};

type AddCommentMutationVariables = {
  payload: DashboardAddCommentRequestDto;
  postId: string;
  tempCommentId: string;
};

type AddCommentInput = {
  payload: DashboardAddCommentRequestDto;
  postId: string;
};

type CachedDashboardPostsEntry = {
  data: DashboardInfiniteData | undefined;
  queryKey: QueryKey;
};

type MutationContext = {
  previousEntries: CachedDashboardPostsEntry[];
};

function mapCommentFromDto(dto: DashboardCommentDto): DashboardPostComment {
  return {
    content: dto.content,
    createdAt: dto.createdAt,
    id: dto.id,
    isPending: false,
    userId: dto.userId,
  };
}

function createTempCommentId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `temp-${crypto.randomUUID()}`;
  }

  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isDashboardPostsKey(queryKey: QueryKey): boolean {
  return queryKey[0] === 'dashboard' && queryKey[1] === 'posts';
}

function updatePostInInfiniteData(
  data: DashboardInfiniteData | undefined,
  postId: string,
  updater: (post: DashboardPost) => DashboardPost,
): DashboardInfiniteData | undefined {
  if (!data) {
    return data;
  }

  let hasChanges = false;
  const nextPages = data.pages.map((page) => {
    let pageChanged = false;
    const nextPosts = page.posts.map((post) => {
      if (post.id !== postId) {
        return post;
      }

      pageChanged = true;
      return updater(post);
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

function captureDashboardPostEntries(queryClient: ReturnType<typeof useQueryClient>): CachedDashboardPostsEntry[] {
  return queryClient
    .getQueriesData<DashboardInfiniteData>({ queryKey: dashboardKeys.all })
    .filter(([queryKey]) => isDashboardPostsKey(queryKey))
    .map(([queryKey, data]) => ({
      data,
      queryKey,
    }));
}

function updateDashboardPostEntries(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  updater: (post: DashboardPost) => DashboardPost,
) {
  const entries = captureDashboardPostEntries(queryClient);

  for (const entry of entries) {
    queryClient.setQueryData<DashboardInfiniteData>(
      entry.queryKey,
      previous => updatePostInInfiniteData(previous, postId, updater),
    );
  }
}

function restoreDashboardPostEntries(
  queryClient: ReturnType<typeof useQueryClient>,
  entries: CachedDashboardPostsEntry[],
) {
  for (const entry of entries) {
    queryClient.setQueryData(entry.queryKey, entry.data);
  }
}

export function usePostActions() {
  const queryClient = useQueryClient();
  const [inFlightAddCommentPostIds, setInFlightAddCommentPostIds] = useState<Record<string, true>>({});
  const [inFlightLikePostIds, setInFlightLikePostIds] = useState<Record<string, true>>({});
  const inFlightAddCommentPostIdsRef = useRef(new Set<string>());
  const inFlightLikePostIdsRef = useRef(new Set<string>());

  const toggleLikeMutation = useMutation<
    DashboardLikeResponseDto,
    Error,
    ToggleLikeMutationVariables,
    MutationContext
  >({
    mutationFn: async (variables: ToggleLikeMutationVariables): Promise<DashboardLikeResponseDto> =>
      dashboardService.toggleLike(variables.postId, variables.isCurrentlyLiked),
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      restoreDashboardPostEntries(queryClient, context.previousEntries);
    },
    onMutate: async (variables): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: dashboardKeys.all });
      const previousEntries = captureDashboardPostEntries(queryClient);

      updateDashboardPostEntries(queryClient, variables.postId, post => ({
        ...post,
        isLikedByCurrentUser: !post.isLikedByCurrentUser,
        likeCount: Math.max(0, post.likeCount + (post.isLikedByCurrentUser ? -1 : 1)),
      }));

      return {
        previousEntries,
      };
    },
  });

  const addCommentMutation = useMutation<
    DashboardCommentDto,
    Error,
    AddCommentMutationVariables,
    MutationContext
  >({
    mutationFn: async (variables: AddCommentMutationVariables) =>
      dashboardService.addComment(variables.postId, variables.payload),
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      restoreDashboardPostEntries(queryClient, context.previousEntries);
    },
    onMutate: async (variables): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: dashboardKeys.all });
      const previousEntries = captureDashboardPostEntries(queryClient);
      const tempComment: DashboardPostComment = {
        content: variables.payload.content,
        createdAt: new Date().toISOString(),
        id: variables.tempCommentId,
        isPending: true,
      };

      updateDashboardPostEntries(queryClient, variables.postId, post => ({
        ...post,
        commentCount: Math.max(0, post.commentCount + 1),
        comments: [...(post.comments ?? []), tempComment],
      }));

      return {
        previousEntries,
      };
    },
    onSuccess: (response, variables) => {
      const serverComment = mapCommentFromDto(response);

      updateDashboardPostEntries(queryClient, variables.postId, (post) => {
        const comments = [...(post.comments ?? [])];
        const tempCommentIndex = comments.findIndex(comment => comment.id === variables.tempCommentId);

        if (tempCommentIndex >= 0) {
          comments[tempCommentIndex] = serverComment;
        } else {
          comments.push(serverComment);
        }

        return {
          ...post,
          comments,
        };
      });
    },
  });

  const markCommentInFlight = useCallback((postId: string) => {
    setInFlightAddCommentPostIds(previous => ({
      ...previous,
      [postId]: true,
    }));
  }, []);

  const unmarkCommentInFlight = useCallback((postId: string) => {
    setInFlightAddCommentPostIds((previous) => {
      const next = { ...previous };
      delete next[postId];
      return next;
    });
  }, []);

  const markLikeInFlight = useCallback((postId: string) => {
    setInFlightLikePostIds(previous => ({
      ...previous,
      [postId]: true,
    }));
  }, []);

  const unmarkLikeInFlight = useCallback((postId: string) => {
    setInFlightLikePostIds((previous) => {
      const next = { ...previous };
      delete next[postId];
      return next;
    });
  }, []);

  const isCommentPendingForPost = useCallback(
    (postId: string): boolean => Boolean(inFlightAddCommentPostIds[postId]),
    [inFlightAddCommentPostIds],
  );

  const isLikePendingForPost = useCallback(
    (postId: string): boolean => Boolean(inFlightLikePostIds[postId]),
    [inFlightLikePostIds],
  );

  return {
    addComment: async (variables: AddCommentInput) => {
      if (inFlightAddCommentPostIdsRef.current.has(variables.postId)) {
        return;
      }

      inFlightAddCommentPostIdsRef.current.add(variables.postId);
      markCommentInFlight(variables.postId);
      const tempCommentId = createTempCommentId();

      try {
        await addCommentMutation.mutateAsync({
          ...variables,
          tempCommentId,
        });
      } finally {
        inFlightAddCommentPostIdsRef.current.delete(variables.postId);
        unmarkCommentInFlight(variables.postId);
      }
    },
    addCommentError: addCommentMutation.error instanceof Error ? addCommentMutation.error.message : null,
    isAddingComment: addCommentMutation.isPending,
    isCommentPendingForPost,
    isLikePendingForPost,
    isTogglingLike: toggleLikeMutation.isPending,
    toggleLike: async (variables: ToggleLikeMutationVariables) => {
      if (inFlightLikePostIdsRef.current.has(variables.postId)) {
        return;
      }

      inFlightLikePostIdsRef.current.add(variables.postId);
      markLikeInFlight(variables.postId);

      try {
        await toggleLikeMutation.mutateAsync(variables);
      } finally {
        inFlightLikePostIdsRef.current.delete(variables.postId);
        unmarkLikeInFlight(variables.postId);
      }
    },
    toggleLikeError: toggleLikeMutation.error instanceof Error ? toggleLikeMutation.error.message : null,
  };
}
