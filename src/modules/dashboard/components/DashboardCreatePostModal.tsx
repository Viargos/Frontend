'use client';

import type { ChangeEvent } from 'react';
import { AnimatePresence } from 'framer-motion';
import * as motion from 'framer-motion/client';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthSession } from '@/modules/auth';
import { OverlayModal } from '@/modules/common/components';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  JourneyIcon,
  MapIcon,
  MapPinIcon,
  XIcon,
} from '@/modules/common/icons';
import { useCreatePost, usePostCreationJourneys } from '@/modules/dashboard/hooks';
import { JourneyDropdown } from './JourneyDropdown';

type DashboardCreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type PostType = 'journey-linked' | 'standalone';
type Step = 'select-type' | 'create-post';

type MediaDraft = {
  file: File;
  id: string;
  previewUrl: string;
};

function createMediaDraftId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function SelectTypeStep(props: {
  onCancel: () => void;
  onTypeSelect: (type: PostType) => void;
}) {
  const { onCancel, onTypeSelect } = props;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      exit={{ opacity: 0, y: -20 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Create New Post</h2>
        <p className="text-gray-600">Choose how you&apos;d like to create your post</p>
      </div>

      <div className="space-y-4">
        <motion.button
          className="group w-full rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all duration-200 hover:border-blue-300 hover:bg-blue-50"
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTypeSelect('journey-linked')}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 transition-colors group-hover:bg-blue-200">
                <JourneyIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold text-gray-900">Link to your journey</h3>
              <p className="text-sm text-gray-600">
                Create a post linked to one of your existing journeys. Perfect for sharing highlights and memories.
              </p>
              <div className="mt-3 flex items-center text-sm font-medium text-blue-600">
                <span>Select from your journeys</span>
                <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </motion.button>

        <motion.button
          className="group w-full rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all duration-200 hover:border-green-300 hover:bg-green-50"
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTypeSelect('standalone')}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 transition-colors group-hover:bg-green-200">
                <MapIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold text-gray-900">Post Separately</h3>
              <p className="text-sm text-gray-600">
                Create an independent post with location and media. Great for sharing individual moments.
              </p>
              <div className="mt-3 flex items-center text-sm font-medium text-green-600">
                <span>Add location and media</span>
                <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </motion.button>
      </div>

      <div className="flex justify-end pt-4">
        <button
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

export const DashboardCreatePostModal = (props: DashboardCreatePostModalProps) => {
  const { isOpen, onClose } = props;
  const { session } = useAuthSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaDraftsRef = useRef<MediaDraft[]>([]);
  const [step, setStep] = useState<Step>('select-type');
  const [selectedType, setSelectedType] = useState<PostType>('journey-linked');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedJourneyId, setSelectedJourneyId] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [mediaDrafts, setMediaDrafts] = useState<MediaDraft[]>([]);

  const { createPost, createPostError, isCreatingPost } = useCreatePost({ user: session.user });
  const {
    journeys,
    isLoadingJourneys,
    journeyError,
  } = usePostCreationJourneys(isOpen && step === 'create-post' && selectedType === 'journey-linked');

  const selectedJourney = useMemo(
    () => journeys.find(journey => journey.id === selectedJourneyId),
    [journeys, selectedJourneyId],
  );

  const handleReset = useCallback(() => {
    setStep('select-type');
    setSelectedType('journey-linked');
    setDescription('');
    setLocation('');
    setSelectedJourneyId('');
    setLocalError(null);
    setMediaDrafts((previousDrafts) => {
      for (const draft of previousDrafts) {
        URL.revokeObjectURL(draft.previewUrl);
      }
      return [];
    });
  }, []);

  const handleClose = useCallback(() => {
    if (isCreatingPost) {
      return;
    }

    handleReset();
    onClose();
  }, [handleReset, isCreatingPost, onClose]);

  useEffect(() => {
    mediaDraftsRef.current = mediaDrafts;
  }, [mediaDrafts]);

  useEffect(() => () => {
    for (const draft of mediaDraftsRef.current) {
      URL.revokeObjectURL(draft.previewUrl);
    }
  }, []);

  const handleTypeSelect = useCallback((type: PostType) => {
    setSelectedType(type);
    setStep('create-post');
    setLocalError(null);
  }, []);

  const handleBack = useCallback(() => {
    setStep('select-type');
    setDescription('');
    setLocation('');
    setSelectedJourneyId('');
    setLocalError(null);
    setMediaDrafts((previousDrafts) => {
      for (const draft of previousDrafts) {
        URL.revokeObjectURL(draft.previewUrl);
      }
      return [];
    });
  }, []);

  const handleMediaSelect = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const selected = Array.from(files).slice(0, 10);
    const nextDrafts = selected.map(file => ({
      file,
      id: createMediaDraftId(),
      previewUrl: URL.createObjectURL(file),
    }));

    setMediaDrafts((previousDrafts) => {
      const all = [...previousDrafts, ...nextDrafts].slice(0, 10);
      const removedDrafts = previousDrafts.filter(previousDraft => !all.some(draft => draft.id === previousDraft.id));
      for (const removed of removedDrafts) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return all;
    });

    event.target.value = '';
  }, []);

  const handleMediaRemove = useCallback((draftId: string) => {
    setMediaDrafts((previousDrafts) => {
      const target = previousDrafts.find(draft => draft.id === draftId);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return previousDrafts.filter(draft => draft.id !== draftId);
    });
  }, []);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setLocalError('Description is required.');
      return;
    }

    if (selectedType === 'journey-linked' && !selectedJourneyId) {
      setLocalError('Select a journey before posting.');
      return;
    }

    if (selectedType === 'standalone' && !location.trim()) {
      setLocalError('Location is required for standalone posts.');
      return;
    }

    setLocalError(null);

    try {
      await createPost({
        description: description.trim(),
        journeyId: selectedType === 'journey-linked' ? selectedJourneyId : undefined,
        journeyTitle: selectedType === 'journey-linked' ? selectedJourney?.title : undefined,
        location: selectedType === 'standalone' ? location.trim() : undefined,
        mediaFiles: mediaDrafts.map(media => media.file),
        mediaPreviewUrls: mediaDrafts.map(media => media.previewUrl),
      });

      handleReset();
      onClose();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Unable to create post.');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <OverlayModal ariaLabel="Create post dialog" className="mx-4 max-h-[90vh] max-w-2xl" onClose={handleClose}>
        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative max-h-[90vh] w-full overflow-hidden rounded-xl bg-white shadow-xl"
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <button
            aria-label="Close create post modal"
            className="absolute top-4 right-4 z-20 rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isCreatingPost}
            type="button"
            onClick={handleClose}
          >
            <XIcon className="h-5 w-5" />
          </button>

          <div className="max-h-[90vh] overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {step === 'select-type'
                ? (
                    <SelectTypeStep key="select-type" onCancel={handleClose} onTypeSelect={handleTypeSelect} />
                  )
                : (
                    <motion.div
                      key="create-post"
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-5"
                      exit={{ opacity: 0, x: -20 }}
                      initial={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-1 flex items-center gap-3 pr-8">
                        <button
                          aria-label="Back"
                          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                          disabled={isCreatingPost}
                          type="button"
                          onClick={handleBack}
                        >
                          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {selectedType === 'journey-linked' ? 'Link with Journey' : 'Create Standalone Post'}
                          </h2>
                          <p className="text-sm text-gray-600">
                            {selectedType === 'journey-linked'
                              ? 'Select a journey and add your content'
                              : 'Add location, media, and description'}
                          </p>
                        </div>
                      </div>

                      {selectedType === 'journey-linked'
                        ? (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700" htmlFor="create-post-journey">
                                Journey
                              </label>
                              {isLoadingJourneys
                                ? (
                                    <div className="flex h-11 w-full items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3">
                                      <div className="h-7 w-7 animate-pulse rounded-md bg-gray-200" />
                                      <div className="h-3.5 w-32 animate-pulse rounded bg-gray-200" />
                                    </div>
                                  )
                                : (
                                    <JourneyDropdown
                                      disabled={isCreatingPost}
                                      id="create-post-journey"
                                      journeys={journeys}
                                      value={selectedJourneyId}
                                      onChange={setSelectedJourneyId}
                                    />
                                  )}
                              {journeyError ? <p className="text-xs text-red-600">{journeyError}</p> : null}
                              {!isLoadingJourneys && journeys.length === 0 && !journeyError
                                ? (
                                    <p className="text-xs text-gray-400">No journeys yet. Create one first.</p>
                                  )
                                : null}
                            </div>
                          )
                        : (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700" htmlFor="create-post-location">
                                Location
                              </label>
                              <div className="relative">
                                <MapPinIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                  id="create-post-location"
                                  className="h-11 w-full rounded-lg border border-gray-300 pr-3 pl-9 text-sm text-gray-900 transition-colors outline-none focus:border-[#160E53] focus:ring-1 focus:ring-[#160E53]"
                                  disabled={isCreatingPost}
                                  placeholder="Add location"
                                  type="text"
                                  value={location}
                                  onChange={event => setLocation(event.target.value)}
                                />
                              </div>
                            </div>
                          )}

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700" htmlFor="create-post-description">
                          Description
                        </label>
                        <textarea
                          id="create-post-description"
                          className="min-h-[120px] w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 transition-colors outline-none focus:border-[#160E53] focus:ring-1 focus:ring-[#160E53]"
                          disabled={isCreatingPost}
                          maxLength={2000}
                          placeholder="Share your travel moment..."
                          value={description}
                          onChange={event => setDescription(event.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Media (optional)</span>
                          <span className="text-xs text-gray-500">
                            {mediaDrafts.length}
                            /10 files
                          </span>
                        </div>

                        <button
                          className="flex h-24 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isCreatingPost || mediaDrafts.length >= 10}
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="h-5 w-5" />
                          <span>Add photos</span>
                        </button>

                        <input
                          ref={fileInputRef}
                          accept="image/*"
                          className="hidden"
                          multiple
                          type="file"
                          onChange={handleMediaSelect}
                        />

                        {mediaDrafts.length > 0
                          ? (
                              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                {mediaDrafts.map(mediaDraft => (
                                  <div key={mediaDraft.id} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                    <Image
                                      alt="Selected post media"
                                      className="object-cover"
                                      fill
                                      sizes="(max-width: 640px) 33vw, 25vw"
                                      src={mediaDraft.previewUrl}
                                      unoptimized
                                    />
                                    <button
                                      aria-label="Remove media"
                                      className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                      disabled={isCreatingPost}
                                      type="button"
                                      onClick={() => handleMediaRemove(mediaDraft.id)}
                                    >
                                      <XIcon className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )
                          : null}
                      </div>

                      {localError || createPostError
                        ? (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                              <p className="text-sm text-red-700">{localError ?? createPostError}</p>
                            </div>
                          )
                        : null}

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isCreatingPost}
                          type="button"
                          onClick={handleClose}
                        >
                          Cancel
                        </button>
                        <button
                          className="rounded-md bg-[#160E53] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isCreatingPost}
                          type="button"
                          onClick={() => void handleSubmit()}
                        >
                          {isCreatingPost ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                    </motion.div>
                  )}
            </AnimatePresence>
          </div>
        </motion.div>
      </OverlayModal>
    </AnimatePresence>
  );
};
