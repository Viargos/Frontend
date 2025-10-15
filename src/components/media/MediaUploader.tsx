import React, { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { UploadOptions } from '@/lib/aws/media-upload';
import { formatFileSize, isImageFile, isVideoFile } from '@/lib/aws/media-upload';

interface MediaUploaderProps {
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  folder?: string;
  fileType?: 'images' | 'videos' | 'documents';
  maxSize?: number;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
}

interface FilePreview {
  file: File;
  preview: string;
  id: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  onUploadComplete,
  onUploadError,
  multiple = false,
  accept = 'image/*',
  maxFiles = 10,
  folder = 'uploads',
  fileType = 'images',
  maxSize,
  className = '',
  disabled = false,
  showPreview = true,
}) => {
  const {
    isUploading,
    uploadProgress,
    errors,
    results,
    uploadSingle,
    uploadMultiple,
    clearErrors,
    reset,
  } = useMediaUpload();

  const [isDragOver, setIsDragOver] = useState(false);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create file preview
  const createFilePreview = useCallback((file: File): string => {
    if (isImageFile(file)) {
      return URL.createObjectURL(file);
    } else if (isVideoFile(file)) {
      return URL.createObjectURL(file);
    }
    return ''; // No preview for other file types
  }, []);

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const validFiles = multiple ? fileArray.slice(0, maxFiles) : [fileArray[0]];

    // Clear previous errors
    clearErrors();

    // Create previews if enabled
    if (showPreview) {
      const previews: FilePreview[] = validFiles.map(file => ({
        file,
        preview: createFilePreview(file),
        id: `${file.name}-${Date.now()}`,
      }));
      setFilePreviews(previews);
    }

    try {
      const uploadOptions: UploadOptions = {
        folder,
        fileType,
        maxSize,
      };

      let uploadResults;
      if (multiple && validFiles.length > 1) {
        uploadResults = await uploadMultiple(validFiles, uploadOptions);
      } else {
        const singleResult = await uploadSingle(validFiles[0], uploadOptions);
        uploadResults = [singleResult];
      }

      // Get successful upload URLs
      const successfulUrls = uploadResults
        .filter(result => result.success && result.url)
        .map(result => result.url!);

      // Check for errors
      const failedUploads = uploadResults.filter(result => !result.success);
      if (failedUploads.length > 0) {
        const errorMessage = failedUploads.map(result => result.error).join(', ');
        onUploadError?.(errorMessage);
      }

      // Call completion callback with successful URLs
      if (successfulUrls.length > 0) {
        onUploadComplete?.(successfulUrls);
      }

    } catch (error: any) {
      onUploadError?.(error.message || 'Upload failed');
    }
  }, [
    disabled,
    multiple,
    maxFiles,
    showPreview,
    clearErrors,
    createFilePreview,
    folder,
    fileType,
    maxSize,
    uploadMultiple,
    uploadSingle,
    onUploadComplete,
    onUploadError,
  ]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  // Handle click to select files
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  // Remove file preview
  const removeFilePreview = useCallback((id: string) => {
    setFilePreviews(prev => {
      const updated = prev.filter(preview => preview.id !== id);
      // Revoke object URLs to prevent memory leaks
      const removedPreview = prev.find(p => p.id === id);
      if (removedPreview?.preview) {
        URL.revokeObjectURL(removedPreview.preview);
      }
      return updated;
    });
  }, []);

  // Get overall progress
  const overallProgress = Object.keys(uploadProgress).length > 0 
    ? Object.values(uploadProgress).reduce((sum, progress) => sum + progress.percentage, 0) / Object.keys(uploadProgress).length
    : 0;

  // Check if there are any errors
  const hasErrors = Object.keys(errors).length > 0;
  const errorMessage = Object.values(errors).filter(Boolean).join(', ');

  return (
    <div className={`relative ${className}`}>
      {/* Main Upload Area */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={disabled ? {} : { scale: 1.01 }}
        whileTap={disabled ? {} : { scale: 0.99 }}
      >
        {/* Upload Icon */}
        <div className="mx-auto w-12 h-12 mb-4">
          <svg
            className="w-full h-full text-gray-400"
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
        </div>

        {/* Upload Text */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            {isDragOver ? 'Drop files here' : 'Upload files'}
          </p>
          <p className="text-sm text-gray-500">
            {multiple 
              ? `Drag and drop up to ${maxFiles} files, or click to browse`
              : 'Drag and drop a file, or click to browse'
            }
          </p>
          <p className="text-xs text-gray-400">
            {accept} • Max {formatFileSize(maxSize || (fileType === 'videos' ? 100 * 1024 * 1024 : 10 * 1024 * 1024))}
          </p>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Uploading... {Math.round(overallProgress)}%
            </p>
          </motion.div>
        )}

        {/* Hidden Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
        />
      </motion.div>

      {/* Error Messages */}
      <AnimatePresence>
        {hasErrors && (
          <motion.div
            className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-red-800 font-medium">Upload Error</p>
                <p className="text-xs text-red-700">{errorMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Previews */}
      {showPreview && filePreviews.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Selected Files</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            <AnimatePresence>
              {filePreviews.map((filePreview) => (
                <motion.div
                  key={filePreview.id}
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {filePreview.preview ? (
                      isImageFile(filePreview.file) ? (
                        <img
                          src={filePreview.preview}
                          alt={filePreview.file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={filePreview.preview}
                          className="w-full h-full object-cover"
                          muted
                        />
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <motion.button
                    onClick={() => removeFilePreview(filePreview.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>

                  {/* File Info */}
                  <div className="mt-1">
                    <p className="text-xs text-gray-600 truncate" title={filePreview.file.name}>
                      {filePreview.file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(filePreview.file.size)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
