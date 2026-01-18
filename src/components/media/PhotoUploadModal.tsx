'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import MediaUploader from '@/components/media/MediaUploader';
import { Modal, Button } from '@/components/ui';
import { useScrollResetOnUnmount } from '@/hooks/useBodyScrollLock';
import { CloseIcon, ErrorCircleIcon, XIcon } from '@/components/icons';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotosUploaded: (photoKeys: string[]) => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  onPhotosUploaded,
}) => {
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { isUploading, reset } = useMediaUpload();

  // Failsafe to reset scroll if modal gets stuck
  useScrollResetOnUnmount();

  const handleUploadComplete = useCallback((urls: string[]) => {
    // Store the final, public file URLs returned from the backend.
    // These URLs are what should be used for previews and review rendering.
    console.log("Upload success, public image URLs (modal):", urls);
    setUploadedPhotos((prev) => {
      const next = [...prev, ...urls];
      console.log("Images state after upload (modal uploadedPhotos):", next);
      return next;
    });
    setUploadError(null);
  }, []);

  const handleUploadError = useCallback((error: string) => {
    setUploadError(error);
  }, []);

  const handleSave = useCallback(() => {
    if (uploadedPhotos.length > 0) {
      console.log("Saving uploaded photos for place/journey:", uploadedPhotos);
      onPhotosUploaded(uploadedPhotos);
      handleClose();
    }
  }, [uploadedPhotos, onPhotosUploaded]);

  const handleClose = useCallback(() => {
    setUploadedPhotos([]);
    setUploadError(null);
    // Add a small delay to ensure cleanup happens properly
    setTimeout(() => {
      onClose();
    }, 50);
  }, [onClose, reset]);

  const removePhoto = useCallback((indexToRemove: number) => {
    setUploadedPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-4xl">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add Photos & Videos</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="mb-6">
          <MediaUploader
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            multiple={true}
            accept="image/*,video/*"
            maxFiles={10}
            folder="journey-photos"
            fileType="images"
            showPreview={true}
            className="w-full"
          />
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
            >
              <div className="flex">
                <ErrorCircleIcon className="w-5 h-5 text-red-400 mr-2" size={20} />
                <div>
                  <p className="text-sm text-red-800 font-medium">Upload Error</p>
                  <p className="text-xs text-red-700">{uploadError}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Uploaded Photos Preview (uses final file URLs, not upload URLs) */}
        {uploadedPhotos.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Uploaded Photos ({uploadedPhotos.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {uploadedPhotos.map((photoUrl, index) => (
                photoUrl && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={photoUrl}
                    alt={`Uploaded photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded max-w-[90%] truncate">
                    {photoUrl.split("/").pop()}
                  </div>
                </motion.div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isUploading || uploadedPhotos.length === 0}
          >
            Add Photos ({uploadedPhotos.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PhotoUploadModal;
