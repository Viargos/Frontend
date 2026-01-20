import { useState, useEffect, useRef, useCallback } from 'react';
import { postService } from '@/lib/services/service-factory';

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
 * - Instantly updates UI on click (optimistic update)
 * - API call happens in background
 * - Rolls back on error
 * - Syncs with backend response on success
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
      const response = shouldLike
        ? await postService.likePost(postId)
        : await postService.unlikePost(postId);

      if (response.data) {
        // Sync with backend response (source of truth)
        // Usually this will match our optimistic update
        setIsLiked(response.data.isLiked);
        setLocalLikeCount(response.data.likeCount);

        // Update parent with actual backend values
        onLikeChange?.(postId, response.data.isLiked, response.data.likeCount);
      }
    } catch {
      // ❌ ROLLBACK - Revert to previous state on error
      setIsLiked(previousIsLiked);
      setLocalLikeCount(previousLikeCount);

      // Notify parent to rollback
      onLikeChange?.(postId, previousIsLiked, previousLikeCount);
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
