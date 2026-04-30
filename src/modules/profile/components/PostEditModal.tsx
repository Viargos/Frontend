'use client';

import { AnimatePresence } from 'framer-motion';
import * as motion from 'framer-motion/client';
import Image from 'next/image';
import { OverlayModal, Skeleton } from '@/modules/common';
import {
  ImageIcon,
  JourneyIcon,
  MapIcon,
  MapPinIcon,
  SpinnerIcon,
  TrashIcon,
  XIcon,
} from '@/modules/common/icons';
import { JourneyDropdown, usePostCreationJourneys } from '@/modules/dashboard/api';
import { useEditPost } from '@/modules/profile/hooks/use-edit-post';

type PostEditModalProps = {
  postId: string;
  onClose: () => void;
  onDeleted: () => void;
  onSaved: (updatedDescription: string) => void;
};

function PostEditSkeleton() {
  return (
    <div className="space-y-5 p-6">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
      <Skeleton className="h-11 w-full rounded-lg" />
      <Skeleton className="h-28 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-9 w-28 rounded-md" />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function PostEditModal(props: PostEditModalProps) {
  const { postId, onClose, onDeleted, onSaved } = props;

  const {
    confirmDelete,
    description,
    existingMedia,
    fileInputRef,
    isDeleting,
    isLoading,
    isSaving,
    journeyId,
    localError,
    location,
    mediaDrafts,
    postDetail,
    postType,
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
  } = useEditPost({ onDeleted, onSaved, postId });

  const { journeys, isLoadingJourneys } = usePostCreationJourneys(
    !isLoading && postType === 'journey-linked',
  );

  const isPending = isSaving || isDeleting;

  return (
    <OverlayModal ariaLabel="Edit post" className="mx-4 max-h-[90vh] max-w-2xl" onClose={onClose}>
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-xl"
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Edit Post</h2>
          <button
            aria-label="Close edit post modal"
            className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            type="button"
            onClick={onClose}
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(90vh-64px)] overflow-y-auto">
          {isLoading
            ? (
                <PostEditSkeleton />
              )
            : (
                <div className="space-y-5 p-6">

                  {/* Post type selector */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">Post type</span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                          postType === 'journey-linked'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                        }`}
                        disabled={isPending}
                        type="button"
                        onClick={() => {
                          setPostType('journey-linked');
                          setLocalError(null);
                        }}
                      >
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${postType === 'journey-linked' ? 'bg-blue-200' : 'bg-blue-100'}`}>
                          <JourneyIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Journey Post</p>
                          <p className="text-xs text-gray-500">Link to a journey</p>
                        </div>
                      </button>

                      <button
                        className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                          postType === 'standalone'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50'
                        }`}
                        disabled={isPending}
                        type="button"
                        onClick={() => {
                          setPostType('standalone');
                          setLocalError(null);
                        }}
                      >
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${postType === 'standalone' ? 'bg-green-200' : 'bg-green-100'}`}>
                          <MapIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Standalone</p>
                          <p className="text-xs text-gray-500">Add a location</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Journey or location */}
                  <AnimatePresence mode="wait">
                    {postType === 'journey-linked'
                      ? (
                          <motion.div
                            key="journey"
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-2"
                            exit={{ opacity: 0, x: -10 }}
                            initial={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.15 }}
                          >
                            <label className="text-sm font-medium text-gray-700" htmlFor="edit-post-journey">
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
                                    disabled={isPending}
                                    id="edit-post-journey"
                                    journeys={journeys}
                                    value={journeyId}
                                    onChange={setJourneyId}
                                  />
                                )}
                          </motion.div>
                        )
                      : (
                          <motion.div
                            key="location"
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-2"
                            exit={{ opacity: 0, x: 10 }}
                            initial={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                          >
                            <label className="text-sm font-medium text-gray-700" htmlFor="ep-location">
                              Location
                            </label>
                            <div className="relative">
                              <MapPinIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                              <input
                                className="h-11 w-full rounded-lg border border-gray-300 pr-3 pl-9 text-sm text-gray-900 transition-colors outline-none focus:border-[#160E53] focus:ring-1 focus:ring-[#160E53]"
                                disabled={isPending}
                                id="ep-location"
                                placeholder="Add location"
                                type="text"
                                value={location}
                                onChange={event => setLocation(event.target.value)}
                              />
                            </div>
                          </motion.div>
                        )}
                  </AnimatePresence>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="ep-description">
                      Description
                    </label>
                    <textarea
                      className="min-h-[120px] w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 transition-colors outline-none focus:border-[#160E53] focus:ring-1 focus:ring-[#160E53] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isPending}
                      id="ep-description"
                      maxLength={2000}
                      placeholder="Share your travel moment..."
                      value={description}
                      onChange={event => setDescription(event.target.value)}
                    />
                  </div>

                  {/* Media management */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Photos</span>
                      <span className="text-xs text-gray-500">
                        {existingMedia.length + mediaDrafts.length}
                        {' '}
                        / 10
                      </span>
                    </div>

                    {/* Existing media with remove option */}
                    {(existingMedia.length > 0 || removedMediaUrls.size > 0)
                      ? (
                          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                            {(postDetail?.media ?? []).map((item, i) => {
                              const isRemoved = removedMediaUrls.has(item.url);
                              return (
                                <div
                                  key={item.url}
                                  className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                                >
                                  <Image
                                    alt={`Post image ${i + 1}`}
                                    className={`object-cover transition-opacity ${isRemoved ? 'opacity-30' : ''}`}
                                    fill
                                    sizes="(max-width: 640px) 25vw, 20vw"
                                    src={item.url}
                                    unoptimized
                                  />
                                  {isRemoved && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                      <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                        Removed
                                      </span>
                                    </div>
                                  )}
                                  <button
                                    aria-label={isRemoved ? 'Undo remove image' : 'Remove image'}
                                    className={`absolute top-1 right-1 rounded-full p-1 text-white transition-all ${
                                      isRemoved
                                        ? 'bg-green-600 opacity-100 hover:bg-green-700'
                                        : 'bg-black/70 opacity-0 group-hover:opacity-100 hover:bg-black/90'
                                    }`}
                                    disabled={isPending}
                                    type="button"
                                    onClick={() => toggleMediaRemoved(item.url)}
                                  >
                                    {isRemoved
                                      ? <span className="px-0.5 text-[10px] leading-none font-bold">↩</span>
                                      : <XIcon className="h-3 w-3" />}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )
                      : null}

                    <button
                      className="flex h-20 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isPending || existingMedia.length + mediaDrafts.length >= 10}
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
                      onChange={handleMediaAdd}
                    />

                    {mediaDrafts.length > 0
                      ? (
                          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                            {mediaDrafts.map(draft => (
                              <div
                                key={draft.id}
                                className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                              >
                                <Image
                                  alt="New media"
                                  className="object-cover"
                                  fill
                                  sizes="(max-width: 640px) 25vw, 20vw"
                                  src={draft.previewUrl}
                                  unoptimized
                                />
                                <button
                                  aria-label="Remove image"
                                  className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                  disabled={isPending}
                                  type="button"
                                  onClick={() => handleMediaDraftRemove(draft.id)}
                                >
                                  <XIcon className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )
                      : null}
                  </div>

                  {/* Error */}
                  {localError
                    ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                          <p className="text-sm text-red-700">{localError}</p>
                        </div>
                      )
                    : null}

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    {/* Delete */}
                    {confirmDelete
                      ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Delete this post?</span>
                            <button
                              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                              disabled={isDeleting}
                              type="button"
                              onClick={() => setConfirmDelete(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                              disabled={isDeleting}
                              type="button"
                              onClick={handleDeleteConfirm}
                            >
                              {isDeleting
                                ? (
                                    <SpinnerIcon className="animate-spin" size={12} />
                                  )
                                : (
                                    <TrashIcon className="h-3 w-3" />
                                  )}
                              Confirm delete
                            </button>
                          </div>
                        )
                      : (
                          <button
                            className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isPending}
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            Delete post
                          </button>
                        )}

                    {/* Save / Cancel */}
                    <div className="flex gap-3">
                      <button
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isPending}
                        type="button"
                        onClick={onClose}
                      >
                        Cancel
                      </button>
                      <button
                        className="flex items-center gap-2 rounded-md bg-[#160E53] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isPending}
                        type="button"
                        onClick={handleSave}
                      >
                        {isSaving
                          ? (
                              <>
                                <SpinnerIcon className="animate-spin" size={14} />
                                Saving…
                              </>
                            )
                          : 'Save changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
        </div>
      </motion.div>
    </OverlayModal>
  );
}
