'use client';

import type { ChangeEvent } from 'react';
import type { PostMediaItem } from '@/modules/profile/types/profile.types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { profileService } from '@/modules/profile/services/profile.service';

export type PostType = 'journey-linked' | 'standalone';

export type MediaDraft = {
  file: File;
  id: string;
  previewUrl: string;
};

type PostEditDraftState = {
  description: string;
  journeyId: string;
  location: string;
  postType: PostType;
};

function makeDraftId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type UseEditPostOptions = {
  onDeleted: () => void;
  onSaved: (updatedDescription: string) => void;
  postId: string;
};

function createPostEditDraft(postDetail?: Awaited<ReturnType<typeof profileService.getPostById>>): PostEditDraftState {
  if (!postDetail) {
    return {
      description: '',
      journeyId: '',
      location: '',
      postType: 'standalone',
    };
  }

  return {
    description: postDetail.description,
    journeyId: postDetail.journeyId ?? '',
    location: postDetail.location ?? '',
    postType: postDetail.journeyId ? 'journey-linked' : 'standalone',
  };
}

export function useEditPost(options: UseEditPostOptions) {
  const { postId, onSaved, onDeleted } = options;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaDraftsRef = useRef<MediaDraft[]>([]);

  const { data: postDetail, isLoading } = useQuery({
    queryKey: ['post', 'detail', postId],
    queryFn: () => profileService.getPostById(postId),
    staleTime: 0,
  });

  const [draftState, setDraftState] = useState<PostEditDraftState | null>(null);
  const [mediaDrafts, setMediaDrafts] = useState<MediaDraft[]>([]);
  const [removedMediaUrls, setRemovedMediaUrls] = useState<Set<string>>(() => new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    mediaDraftsRef.current = mediaDrafts;
  }, [mediaDrafts]);

  useEffect(() => {
    return () => {
      for (const draft of mediaDraftsRef.current) {
        URL.revokeObjectURL(draft.previewUrl);
      }
    };
  }, []);

  const editableState = draftState ?? createPostEditDraft(postDetail);

  const setDescription = useCallback((description: string) => {
    setDraftState(previous => ({
      ...(previous ?? createPostEditDraft(postDetail)),
      description,
    }));
  }, [postDetail]);

  const setJourneyId = useCallback((journeyId: string) => {
    setDraftState(previous => ({
      ...(previous ?? createPostEditDraft(postDetail)),
      journeyId,
    }));
  }, [postDetail]);

  const setLocation = useCallback((location: string) => {
    setDraftState(previous => ({
      ...(previous ?? createPostEditDraft(postDetail)),
      location,
    }));
  }, [postDetail]);

  const setPostType = useCallback((postType: PostType) => {
    setDraftState((previous) => {
      const nextState = {
        ...(previous ?? createPostEditDraft(postDetail)),
        postType,
      };

      if (postType === 'journey-linked') {
        nextState.location = '';
      } else {
        nextState.journeyId = '';
      }

      return nextState;
    });
  }, [postDetail]);

  const toggleMediaRemoved = useCallback((mediaUrl: string) => {
    setRemovedMediaUrls((previous) => {
      const next = new Set(previous);
      if (next.has(mediaUrl)) {
        next.delete(mediaUrl);
      } else {
        next.add(mediaUrl);
      }
      return next;
    });
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const trimmedDescription = editableState.description.trim();
      if (!trimmedDescription) {
        throw new Error('Description cannot be empty.');
      }

      // 1. Delete removed existing media
      const mediaToRemove = (postDetail?.media ?? []).filter(m => removedMediaUrls.has(m.url));
      for (const media of mediaToRemove) {
        await profileService.removePostMedia(postId, media.url);
      }

      // 2. Update post text / journey / location
      await profileService.updatePost(postId, {
        description: trimmedDescription,
        journeyId: editableState.postType === 'journey-linked' ? (editableState.journeyId || null) : null,
        location: editableState.postType === 'standalone' ? (editableState.location.trim() || null) : null,
      });

      // 3. Upload and attach new media drafts
      for (const draft of mediaDraftsRef.current) {
        const imageUrl = await profileService.uploadPostMedia(draft.file);
        await profileService.addPostMedia(postId, imageUrl);
      }

      return trimmedDescription;
    },
    onSuccess: (trimmedDescription) => {
      for (const draft of mediaDraftsRef.current) {
        URL.revokeObjectURL(draft.previewUrl);
      }
      setMediaDrafts([]);
      mediaDraftsRef.current = [];
      setRemovedMediaUrls(new Set());
      setDraftState(null);
      onSaved(trimmedDescription);
    },
    onError: (err) => {
      setLocalError(err instanceof Error ? err.message : 'Failed to save post.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => profileService.deletePost(postId),
    onSuccess: onDeleted,
    onError: (err) => {
      setLocalError(err instanceof Error ? err.message : 'Failed to delete post.');
      setConfirmDelete(false);
    },
  });

  const handleMediaAdd = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const newDrafts = Array.from(files).slice(0, 10).map(file => ({
      file,
      id: makeDraftId(),
      previewUrl: URL.createObjectURL(file),
    }));

    setMediaDrafts((previous) => {
      const merged = [...previous, ...newDrafts].slice(0, 10);
      mediaDraftsRef.current = merged;
      return merged;
    });

    event.target.value = '';
  }, []);

  const handleMediaDraftRemove = useCallback((draftId: string) => {
    setMediaDrafts((previous) => {
      const target = previous.find(d => d.id === draftId);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      const next = previous.filter(d => d.id !== draftId);
      mediaDraftsRef.current = next;
      return next;
    });
  }, []);

  const handleSave = () => {
    setLocalError(null);
    saveMutation.mutate();
  };

  const handleDeleteConfirm = () => {
    setLocalError(null);
    deleteMutation.mutate();
  };

  // Derive visible (not-removed) existing media for display
  const existingMedia: PostMediaItem[] = (postDetail?.media ?? []).filter(
    m => !removedMediaUrls.has(m.url),
  );

  return {
    confirmDelete,
    description: editableState.description,
    existingMedia,
    fileInputRef,
    isDeleting: deleteMutation.isPending,
    isLoading,
    isSaving: saveMutation.isPending,
    journeyId: editableState.journeyId,
    localError,
    location: editableState.location,
    mediaDrafts,
    postDetail,
    postType: editableState.postType,
    removedMediaUrls,
    handleDeleteConfirm,
    handleMediaAdd,
    handleMediaDraftRemove,
    handleSave,
    setConfirmDelete,
    setDescription,
    setJourneyId,
    setLocalError,
    setLocation,
    setPostType,
    toggleMediaRemoved,
  };
}
