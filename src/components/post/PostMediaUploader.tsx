"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { postService } from "@/lib/services/service-factory";

interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: string;
}

interface PostMediaUploaderProps {
  onMediaChange: (media: MediaItem[]) => void;
  maxFiles?: number;
  className?: string;
}

export default function PostMediaUploader({
  onMediaChange,
  maxFiles = 5,
  className = "",
}: PostMediaUploaderProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMediaItems = useCallback(
    (items: MediaItem[]) => {
      setMediaItems(items);
      onMediaChange(items);
    },
    [onMediaChange]
  );

  const handleFileSelect = useCallback(
    async (files: FileList) => {
      if (files.length === 0) return;

      const fileArray = Array.from(files);
      const remainingSlots = maxFiles - mediaItems.length;
      const filesToUpload = fileArray.slice(0, remainingSlots);

      if (filesToUpload.length === 0) {
        setUploadError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const uploadPromises = filesToUpload.map(async (file) => {
          // Use PostService uploadPostMedia method (following DRY principle)
          const response = await postService.uploadPostMedia(file);

          if (response.data) {
            return {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              url: response.data.imageUrl,
              name: file.name,
              type: file.type,
            };
          }
          throw new Error(response.message || "Upload failed");
        });

        const uploadedItems = await Promise.all(uploadPromises);
        const updatedItems = [...mediaItems, ...uploadedItems];
        updateMediaItems(updatedItems);
      } catch (error: any) {
        console.error("Upload error:", error);
        setUploadError(error.message || "Failed to upload files");
      } finally {
        setIsUploading(false);
      }
    },
    [mediaItems, maxFiles, updateMediaItems]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFileSelect(e.target.files);
      }
    },
    [handleFileSelect]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const updatedItems = mediaItems.filter((item) => item.id !== id);
      updateMediaItems(updatedItems);
    },
    [mediaItems, updateMediaItems]
  );

  const canUploadMore = mediaItems.length < maxFiles;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Media (Optional)</h3>
          <p className="text-xs text-gray-500">
            {mediaItems.length}/{maxFiles} files
          </p>
        </div>

        {/* Upload Button */}
        {canUploadMore && (
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400 py-8"
          >
            <div className="text-center">
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm">Uploading...</p>
                </>
              ) : (
                <>
                  <svg
                    className="mx-auto h-8 w-8 text-gray-400 mb-2"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-sm text-gray-600">
                    Click to upload images
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, WebP up to 10MB
                  </p>
                </>
              )}
            </div>
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleInputChange}
          disabled={isUploading || !canUploadMore}
        />

        {/* Upload Error */}
        {uploadError && (
          <motion.div
            className="bg-red-50 border border-red-200 rounded-lg p-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-sm text-red-600">{uploadError}</p>
          </motion.div>
        )}
      </div>

      {/* Media Gallery */}
      {mediaItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {mediaItems.map((item) => (
            <motion.div
              key={item.id}
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-full object-cover"
              />

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
