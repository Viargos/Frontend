import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MediaUploader from "./MediaUploader";
import MediaGallery from "./MediaGallery";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { deleteMediaFile } from "@/lib/aws/media-upload";

interface MediaItem {
  id: string;
  url: string;
  name?: string;
  size?: number;
  type?: string;
  uploadedAt?: string;
}

interface MediaManagerProps {
  initialMedia?: MediaItem[];
  onMediaChange?: (media: MediaItem[]) => void;
  uploadFolder?: string;
  fileType?: "images" | "videos" | "documents";
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string;
  allowMultiple?: boolean;
  allowReorder?: boolean;
  showGallery?: boolean;
  showUploader?: boolean;
  galleryColumns?: number;
  className?: string;
}

export const MediaManager: React.FC<MediaManagerProps> = ({
  initialMedia = [],
  onMediaChange,
  uploadFolder = "uploads",
  fileType = "images",
  maxFiles = 10,
  maxFileSize,
  acceptedTypes,
  allowMultiple = true,
  allowReorder = true,
  showGallery = true,
  showUploader = true,
  galleryColumns = 4,
  className = "",
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMedia);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { isUploading } = useMediaUpload();

  // Get default accepted types based on fileType
  const getAcceptedTypes = useCallback(() => {
    if (acceptedTypes) return acceptedTypes;

    switch (fileType) {
      case "images":
        return "image/*";
      case "videos":
        return "video/*";
      case "documents":
        return ".pdf,.doc,.docx,.txt,.rtf";
      default:
        return "*/*";
    }
  }, [acceptedTypes, fileType]);

  // Get default max file size based on type
  const getMaxFileSize = useCallback(() => {
    if (maxFileSize) return maxFileSize;

    switch (fileType) {
      case "videos":
        return 100 * 1024 * 1024; // 100MB for videos
      case "documents":
        return 10 * 1024 * 1024; // 10MB for documents
      default:
        return 5 * 1024 * 1024; // 5MB for images
    }
  }, [maxFileSize, fileType]);

  // Update media items and notify parent
  const updateMediaItems = useCallback(
    (items: MediaItem[]) => {
      setMediaItems(items);
      onMediaChange?.(items);
    },
    [onMediaChange]
  );

  // Handle upload completion
  const handleUploadComplete = useCallback(
    (urls: string[]) => {
      const newItems: MediaItem[] = urls.map((url) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url,
        uploadedAt: new Date().toISOString(),
      }));

      const updatedItems = [...mediaItems, ...newItems];

      // Respect maxFiles limit
      if (updatedItems.length > maxFiles) {
        const limitedItems = updatedItems.slice(-maxFiles);
        updateMediaItems(limitedItems);
      } else {
        updateMediaItems(updatedItems);
      }
    },
    [mediaItems, maxFiles, updateMediaItems]
  );

  // Handle upload error
  const handleUploadError = useCallback((error: string) => {
    console.error("Upload error:", error);
    // You could show a toast notification here
  }, []);

  // Handle media deletion
  const handleDelete = useCallback(
    async (id: string) => {
      const itemToDelete = mediaItems.find((item) => item.id === id);
      if (!itemToDelete) return;

      setIsDeleting(id);
      setDeleteError(null);

      try {
        if (typeof itemToDelete.url !== "string") {
          throw new Error("Invalid URL format");
        }

        // Send the full URL (or key) to the backend; it can handle either
        const result = await deleteMediaFile(itemToDelete.url);
        if (!result.success) {
          throw new Error(result.error || "Failed to delete file");
        }

        // Remove from local state
        const updatedItems = mediaItems.filter((item) => item.id !== id);
        updateMediaItems(updatedItems);
      } catch (error: any) {
        console.error("Delete error:", error);
        setDeleteError(error.message || "Failed to delete file");
      } finally {
        setIsDeleting(null);
      }
    },
    [mediaItems, updateMediaItems]
  );

  // Handle media reordering
  const handleReorder = useCallback(
    (reorderedItems: MediaItem[]) => {
      updateMediaItems(reorderedItems);
    },
    [updateMediaItems]
  );

  // Check if we can upload more files
  const canUploadMore = mediaItems.length < maxFiles;
  const remainingSlots = maxFiles - mediaItems.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Section */}
      {showUploader && (
        <div className="space-y-4">
          {/* Upload Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {fileType === "images"
                  ? "Images"
                  : fileType === "videos"
                  ? "Videos"
                  : "Documents"}
              </h3>
              <p className="text-sm text-gray-500">
                {mediaItems.length} of {maxFiles} files uploaded
                {!canUploadMore && " (Maximum reached)"}
              </p>
            </div>

            {mediaItems.length > 0 && (
              <button
                onClick={() => updateMediaItems([])}
                disabled={isUploading || isDeleting !== null}
                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Upload Component */}
          <MediaUploader
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            multiple={allowMultiple}
            accept={getAcceptedTypes()}
            maxFiles={remainingSlots}
            folder={uploadFolder}
            fileType={fileType}
            maxSize={getMaxFileSize()}
            disabled={!canUploadMore || isUploading}
            className={!canUploadMore ? "opacity-60" : ""}
          />

          {/* Upload Limit Warning */}
          {!canUploadMore && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-amber-400 mr-2 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm text-amber-800 font-medium">
                    Upload limit reached
                  </p>
                  <p className="text-xs text-amber-700">
                    You have reached the maximum of {maxFiles} files. Delete
                    some files to upload more.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Error */}
      <AnimatePresence>
        {deleteError && (
          <motion.div
            className="bg-red-50 border border-red-200 rounded-lg p-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm text-red-800 font-medium">Delete Error</p>
                <p className="text-xs text-red-700">{deleteError}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Section */}
      {showGallery && (
        <div>
          {mediaItems.length > 0 ? (
            <MediaGallery
              items={mediaItems}
              onDelete={handleDelete}
              onReorder={allowReorder ? handleReorder : undefined}
              columns={galleryColumns}
              allowReorder={allowReorder}
              showControls={true}
              showLightbox={true}
            />
          ) : showUploader ? null : (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="mx-auto w-12 h-12 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 48 48"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                />
              </svg>
              <p className="text-lg font-medium">No media files</p>
              <p className="text-sm">No files have been uploaded yet</p>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {(isUploading || isDeleting) && (
          <motion.div
            className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-gray-700">
                  {isUploading ? "Uploading..." : "Deleting..."}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaManager;
