'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import MediaUploader from '@/components/media/MediaUploader';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useScrollResetOnUnmount } from '@/hooks/useBodyScrollLock';

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
    // Extract S3 keys from URLs for storage
    const keys = urls.map(url => {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1]; // Get the filename from URL
    });
    
    setUploadedPhotos(prev => [...prev, ...keys]);
    setUploadError(null);
  }, []);

  const handleUploadError = useCallback((error: string) => {
    setUploadError(error);
  }, []);

  const handleSave = useCallback(() => {
    if (uploadedPhotos.length > 0) {
      onPhotosUploaded(uploadedPhotos);
      handleClose();
    }
  }, [uploadedPhotos, onPhotosUploaded]);

  const handleClose = useCallback(() => {
    setUploadedPhotos([]);
    setUploadError(null);
    reset();
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-red-800 font-medium">Upload Error</p>
                  <p className="text-xs text-red-700">{uploadError}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Uploaded Photos Preview */}
        {uploadedPhotos.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Uploaded Photos ({uploadedPhotos.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {uploadedPhotos.map((photo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                    {photo.split('-').pop()}
                  </div>
                </motion.div>
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
