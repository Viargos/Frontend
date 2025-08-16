'use client';

import { useState, useCallback } from 'react';

interface UseFileUploadOptions {
  accept?: string[];
  maxSize?: number; // in bytes
  maxFiles?: number;
  onError?: (error: string) => void;
}

interface FileUploadState {
  files: File[];
  isDragOver: boolean;
  isUploading: boolean;
  uploadProgress: { [key: string]: number };
  errors: string[];
}

interface UseFileUploadReturn extends FileUploadState {
  addFiles: (files: FileList | File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  uploadFiles: (uploadFunction: (files: File[]) => Promise<any>) => Promise<void>;
  getDragHandlers: () => {
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  getInputProps: () => {
    accept: string;
    multiple: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
}

/**
 * Custom hook for handling file uploads with drag-and-drop support
 */
export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const {
    accept = [],
    maxSize = 10 * 1024 * 1024, // 10MB default
    maxFiles = 10,
    onError
  } = options;

  const [state, setState] = useState<FileUploadState>({
    files: [],
    isDragOver: false,
    isUploading: false,
    uploadProgress: {},
    errors: []
  });

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (accept.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type.toLowerCase();
      
      const isAccepted = accept.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return acceptedType.toLowerCase() === `.${fileExtension}`;
        }
        if (acceptedType.includes('/')) {
          return mimeType.match(acceptedType.replace('*', '.*'));
        }
        return false;
      });

      if (!isAccepted) {
        return `File type not accepted. Accepted types: ${accept.join(', ')}`;
      }
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    return null;
  }, [accept, maxSize]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const filesToAdd: File[] = [];
    const errors: string[] = [];

    Array.from(newFiles).forEach(file => {
      // Check max files limit
      if (state.files.length + filesToAdd.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Validate file
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        // Check for duplicates
        const isDuplicate = state.files.some(existingFile => 
          existingFile.name === file.name && existingFile.size === file.size
        );
        
        if (isDuplicate) {
          errors.push(`${file.name}: File already added`);
        } else {
          filesToAdd.push(file);
        }
      }
    });

    setState(prev => ({
      ...prev,
      files: [...prev.files, ...filesToAdd],
      errors: [...prev.errors, ...errors]
    }));

    // Call onError callback if there are errors
    if (errors.length > 0 && onError) {
      onError(errors.join(', '));
    }
  }, [state.files, maxFiles, validateFile, onError]);

  const removeFile = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
      errors: prev.errors.filter((_, i) => i !== index)
    }));
  }, []);

  const clearFiles = useCallback(() => {
    setState(prev => ({
      ...prev,
      files: [],
      errors: [],
      uploadProgress: {}
    }));
  }, []);

  const uploadFiles = useCallback(async (uploadFunction: (files: File[]) => Promise<any>) => {
    if (state.files.length === 0) return;

    setState(prev => ({ ...prev, isUploading: true }));

    try {
      await uploadFunction(state.files);
      setState(prev => ({
        ...prev,
        isUploading: false,
        files: [], // Clear files after successful upload
        uploadProgress: {}
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        errors: [...prev.errors, `Upload failed: ${error}`]
      }));
      
      if (onError) {
        onError(`Upload failed: ${error}`);
      }
    }
  }, [state.files, onError]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState(prev => ({ ...prev, isDragOver: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState(prev => ({ ...prev, isDragOver: false }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState(prev => ({ ...prev, isDragOver: false }));
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      addFiles(files);
    }
  }, [addFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  }, [addFiles]);

  const getDragHandlers = useCallback(() => ({
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop
  }), [handleDragOver, handleDragLeave, handleDrop]);

  const getInputProps = useCallback(() => ({
    accept: accept.join(','),
    multiple: maxFiles > 1,
    onChange: handleInputChange
  }), [accept, maxFiles, handleInputChange]);

  return {
    ...state,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    getDragHandlers,
    getInputProps
  };
}

/**
 * Hook specifically for image uploads with preview generation
 */
export function useImageUpload(options: UseFileUploadOptions = {}) {
  const imageOptions = {
    ...options,
    accept: options.accept || ['.jpg', '.jpeg', '.png', '.gif', '.webp', 'image/*']
  };

  const fileUpload = useFileUpload(imageOptions);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  const generatePreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }, []);

  const addFilesWithPreview = useCallback(async (files: FileList | File[]) => {
    fileUpload.addFiles(files);

    // Generate previews for new files
    const newPreviews: { [key: string]: string } = {};
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        newPreviews[file.name] = await generatePreview(file);
      }
    }

    setPreviews(prev => ({ ...prev, ...newPreviews }));
  }, [fileUpload, generatePreview]);

  const removeFileWithPreview = useCallback((index: number) => {
    const fileName = fileUpload.files[index]?.name;
    fileUpload.removeFile(index);
    
    if (fileName && previews[fileName]) {
      setPreviews(prev => {
        const updated = { ...prev };
        delete updated[fileName];
        return updated;
      });
    }
  }, [fileUpload, previews]);

  const clearFilesWithPreview = useCallback(() => {
    fileUpload.clearFiles();
    setPreviews({});
  }, [fileUpload]);

  return {
    ...fileUpload,
    previews,
    addFiles: addFilesWithPreview,
    removeFile: removeFileWithPreview,
    clearFiles: clearFilesWithPreview
  };
}
