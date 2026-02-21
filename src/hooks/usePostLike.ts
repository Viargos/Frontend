import { useState, useEffect, useRef, useCallback } from 'react';
import { PostApi, ApiError } from '@/lib/api';

interface UsePostLikeProps {
  postId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  onLikeChange?: (postId: string, isLiked: boolean, likeCount: number) => void;
}

interface UsePostLikeReturn {
  isLiking: boolean;
  localLikeCount: number;
  isLiked: boolean;
  handleLike: () => void;
}

/**
 * Optimistic like/unlike functionality
 * - Instantly updates UI on click (optimistic update is source of truth)
 * - API call happens in background for persistence
 * - Only rolls back on error
 * - Prevents duplicate likes/unlikes while API is in progress
 * - If already liked, clicking will unlike (and vice versa)
 */
export const usePostLike = ({
  postId,
  initialLikeCount,
  initialIsLiked,
  onLikeChange,
}: UsePostLikeProps): UsePostLikeReturn => {
  const [localLikeCount, setLocalLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLiking, setIsLiking] = useState(false);

  // Use ref to synchronously track in-progress state (prevents race conditions)
  const isLikingRef = useRef(false);

  // Sync with prop changes (only if not currently processing)
  useEffect(() => {
    if (!isLikingRef.current) {
      setIsLiked(initialIsLiked);
      setLocalLikeCount(initialLikeCount);
    }
  }, [initialIsLiked, initialLikeCount]);

  // Memoize handleLike to prevent it from being recreated on every render
  const handleLike = useCallback(async () => {
    // Block if already processing (check ref for synchronous check)
    if (isLikingRef.current) {
      return;
    }

    // Set ref to prevent duplicate clicks
    isLikingRef.current = true;
    setIsLiking(true);

    // Capture current state before optimistic update
    const previousIsLiked = isLiked;
    const previousLikeCount = localLikeCount;
    const shouldLike = !previousIsLiked;

    // 🚀 OPTIMISTIC UPDATE - Update UI immediately
    const optimisticIsLiked = shouldLike;
    const optimisticLikeCount = shouldLike ? previousLikeCount + 1 : previousLikeCount - 1;

    setIsLiked(optimisticIsLiked);
    setLocalLikeCount(optimisticLikeCount);

    // Notify parent immediately with optimistic values
    onLikeChange?.(postId, optimisticIsLiked, optimisticLikeCount);

    try {
      // Make the API call in the background
      // We don't update UI from response - optimistic update is the source of truth
      await (shouldLike ? PostApi.like(postId) : PostApi.unlike(postId));

      // Success - keep the optimistic update (no UI changes needed)
      // The optimistic values are already set and displayed to the user
    } catch (error) {
      // ❌ ROLLBACK - Revert to previous state on error
      setIsLiked(previousIsLiked);
      setLocalLikeCount(previousLikeCount);

      // Notify parent to rollback
      onLikeChange?.(postId, previousIsLiked, previousLikeCount);

      // Log error for debugging (ApiError has getUserMessage())
      if (error instanceof ApiError) {
        console.error('Like/unlike failed:', error.getUserMessage());
      } else {
        console.error('Like/unlike failed:', error);
      }
    } finally {
      // Reset ref and state
      isLikingRef.current = false;
      setIsLiking(false);
    }
  }, [postId, isLiked, localLikeCount, onLikeChange]);

  return {
    isLiking,
    localLikeCount,
    isLiked,
    handleLike,
  };
};
