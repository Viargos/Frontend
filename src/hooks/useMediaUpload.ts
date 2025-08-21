import { useState, useCallback } from "react";
import {
  uploadToS3,
  uploadMultipleToS3,
  deleteFromS3,
  UploadOptions,
  UploadResult,
  UploadProgress,
} from "@/lib/aws/media-upload";

interface UseMediaUploadState {
  isUploading: boolean;
  uploadProgress: { [key: string]: UploadProgress };
  errors: { [key: string]: string };
  results: { [key: string]: UploadResult };
}

interface UseMediaUploadReturn {
  // State
  isUploading: boolean;
  uploadProgress: { [key: string]: UploadProgress };
  errors: { [key: string]: string };
  results: { [key: string]: UploadResult };

  // Actions
  uploadSingle: (file: File, options?: UploadOptions) => Promise<UploadResult>;
  uploadMultiple: (
    files: File[],
    options?: UploadOptions
  ) => Promise<UploadResult[]>;
  deleteFile: (key: string) => Promise<{ success: boolean; error?: string }>;
  clearErrors: () => void;
  clearResults: () => void;
  reset: () => void;

  // Utilities
  getUploadedUrl: (fileKey: string) => string | undefined;
  isFileUploaded: (fileKey: string) => boolean;
  getFileProgress: (fileKey: string) => UploadProgress | undefined;
}

export const useMediaUpload = (): UseMediaUploadReturn => {
  const [state, setState] = useState<UseMediaUploadState>({
    isUploading: false,
    uploadProgress: {},
    errors: {},
    results: {},
  });

  // Upload single file
  const uploadSingle = useCallback(
    async (file: File, options: UploadOptions = {}): Promise<UploadResult> => {
      const fileKey = `${file.name}-${Date.now()}`;

      setState((prev) => ({
        ...prev,
        isUploading: true,
        errors: { ...prev.errors, [fileKey]: "" },
      }));

      try {
        // Use direct S3 upload
        const result = await uploadToS3(
          file,
          options,
          (progress: UploadProgress) => {
            setState((prev) => ({
              ...prev,
              uploadProgress: {
                ...prev.uploadProgress,
                [fileKey]: progress,
              },
            }));
          }
        );

        setState((prev) => ({
          ...prev,
          results: { ...prev.results, [fileKey]: result },
          isUploading: false,
        }));

        if (!result.success && result.error) {
          setState((prev) => ({
            ...prev,
            errors: { ...prev.errors, [fileKey]: result.error! },
          }));
        }

        return result;
      } catch (error: any) {
        const errorMessage = error.message || "Upload failed";
        setState((prev) => ({
          ...prev,
          isUploading: false,
          errors: { ...prev.errors, [fileKey]: errorMessage },
        }));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    []
  );

  // Upload multiple files
  const uploadMultiple = useCallback(
    async (
      files: File[],
      options: UploadOptions = {}
    ): Promise<UploadResult[]> => {
      setState((prev) => ({ ...prev, isUploading: true }));

      try {
        // Use direct S3 upload for multiple files
        const results = await uploadMultipleToS3(
          files,
          options,
          (fileIndex: number, progress: UploadProgress) => {
            const fileKey = `${
              files[fileIndex].name
            }-${Date.now()}-${fileIndex}`;
            setState((prev) => ({
              ...prev,
              uploadProgress: {
                ...prev.uploadProgress,
                [fileKey]: progress,
              },
            }));
          }
        );

        // Update state with results
        const newResults: { [key: string]: UploadResult } = {};
        const newErrors: { [key: string]: string } = {};

        results.forEach((result, index) => {
          const fileKey = `${files[index].name}-${Date.now()}-${index}`;
          newResults[fileKey] = result;

          if (!result.success && result.error) {
            newErrors[fileKey] = result.error;
          }
        });

        setState((prev) => ({
          ...prev,
          isUploading: false,
          results: { ...prev.results, ...newResults },
          errors: { ...prev.errors, ...newErrors },
        }));

        return results;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isUploading: false,
          errors: {
            ...prev.errors,
            general: error.message || "Multiple upload failed",
          },
        }));

        return [];
      }
    },
    []
  );

  // Delete file
  const deleteFile = useCallback(
    async (key: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const result = await deleteFromS3(key);

        if (result.success) {
          // Remove the file from results if it exists
          setState((prev) => {
            const newResults = { ...prev.results };
            const resultKey = Object.keys(newResults).find(
              (k) => newResults[k].key === key
            );
            if (resultKey) {
              delete newResults[resultKey];
            }
            return { ...prev, results: newResults };
          });
        }

        return result;
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Delete failed",
        };
      }
    },
    []
  );

  // Clear errors
  const clearErrors = useCallback(() => {
    setState((prev) => ({ ...prev, errors: {} }));
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    setState((prev) => ({ ...prev, results: {} }));
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    setState({
      isUploading: false,
      uploadProgress: {},
      errors: {},
      results: {},
    });
  }, []);

  // Get uploaded URL by file key
  const getUploadedUrl = useCallback(
    (fileKey: string): string | undefined => {
      return state.results[fileKey]?.url;
    },
    [state.results]
  );

  // Check if file is uploaded
  const isFileUploaded = useCallback(
    (fileKey: string): boolean => {
      return state.results[fileKey]?.success === true;
    },
    [state.results]
  );

  // Get file progress
  const getFileProgress = useCallback(
    (fileKey: string): UploadProgress | undefined => {
      return state.uploadProgress[fileKey];
    },
    [state.uploadProgress]
  );

  return {
    // State
    isUploading: state.isUploading,
    uploadProgress: state.uploadProgress,
    errors: state.errors,
    results: state.results,

    // Actions
    uploadSingle,
    uploadMultiple,
    deleteFile,
    clearErrors,
    clearResults,
    reset,

    // Utilities
    getUploadedUrl,
    isFileUploaded,
    getFileProgress,
  };
};

export default useMediaUpload;
