// NOTE:
// This frontend module no longer talks directly to AWS S3 or uses any AWS credentials.
// All sensitive configuration lives in the backend. The frontend only:
// 1) Asks the backend for a pre-signed upload URL
// 2) Uploads the file to that URL with a standard fetch PUT request

/**
 * Media Upload Module
 *
 * Responsibilities:
 * - Validate files before upload
 * - Get pre-signed URLs from backend via API client
 * - Upload files directly to S3 using pre-signed URLs
 * - Delete files via backend API
 *
 * MUST:
 * - Use API client for backend requests (inherits auth + refresh logic)
 * - Use XMLHttpRequest for direct S3 uploads (no auth needed)
 *
 * MUST NOT:
 * - Use token service or localStorage
 * - Add Authorization headers manually
 * - Handle auth errors (API client does this)
 */

import { getApiClient } from '@/lib/api/client';

// File type configurations
const ALLOWED_FILE_TYPES = {
  images: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
  videos: ["video/mp4", "video/webm", "video/mpeg", "video/quicktime"],
  documents: [
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

const MAX_FILE_SIZES = {
  images: 10 * 1024 * 1024, // 10MB
  videos: 100 * 1024 * 1024, // 100MB
  documents: 5 * 1024 * 1024, // 5MB
};

export interface UploadOptions {
  folder?: string;
  fileType?: "images" | "videos" | "documents";
  maxSize?: number;
  customFileName?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Utility functions
const validateFile = (
  file: File,
  options: UploadOptions
): { isValid: boolean; error?: string } => {
  // Check file type
  if (options.fileType) {
    const allowedTypes = ALLOWED_FILE_TYPES[options.fileType];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${
          file.type
        } is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
      };
    }
  }

  // Check file size
  const maxSize =
    options.maxSize || MAX_FILE_SIZES[options.fileType || "images"];
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      error: `File size ${Math.round(
        file.size / (1024 * 1024)
      )}MB exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
};

const generateUniqueFileName = (
  originalName: string,
  folder?: string
): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  const baseName = originalName.split(".").slice(0, -1).join(".");
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, "-");

  const fileName = `${sanitizedBaseName}-${timestamp}-${randomString}.${extension}`;

  return folder ? `${folder}/${fileName}` : fileName;
};

const getContentType = (file: File): string => {
  return file.type || "application/octet-stream";
};

// Main upload function
export const uploadToS3 = async (
  file: File,
  options: UploadOptions = {},
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    // Validate file
    const validation = validateFile(file, options);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Generate unique file name and determine content type
    const fileName =
      options.customFileName ||
      generateUniqueFileName(file.name, options.folder);
    const contentType = getContentType(file);

    // 1) Ask backend for a pre-signed URL using API client
    //    API client automatically:
    //    - Adds credentials: 'include' for cookies
    //    - Handles token refresh if access token expired
    //    - Logs out if refresh token expired
    const apiClient = getApiClient();

    let presignData: any;
    try {
      presignData = await apiClient.post<any>('/api/users/upload-url', {
        fileName,
        contentType,
        folder: options.folder,
      });
    } catch (error: any) {
      // API client already handled auth errors (refresh/logout)
      // Just return user-friendly message
      console.error('Failed to get upload URL:', error);
      return {
        success: false,
        error: error.message || 'Failed to obtain upload URL. Please try again.',
      };
    }

    // Parse response - support both direct and wrapped formats
    const payload = presignData?.data || presignData;
    const uploadUrl: string | undefined = payload?.uploadUrl;
    const key: string | undefined = payload?.key;
    let fileUrl: string | undefined = payload?.fileUrl;

    // Derive fileUrl from key if not provided
    if (key && !fileUrl) {
      fileUrl = `https://viargos-sandbox.s3.us-east-2.amazonaws.com/${key}`;
    }

    if (!uploadUrl || !key) {
      console.error("Invalid upload URL response:", presignData);
      return {
        success: false,
        error: "Server did not return a valid upload URL.",
      };
    }

    // 2) Upload the file directly to S3 using the pre-signed URL
    //    Pre-signed URL contains auth - no Authorization header needed
    const uploadRequest = new XMLHttpRequest();

    const uploadPromise = new Promise<Response>((resolve, reject) => {
      uploadRequest.open("PUT", uploadUrl, true);
      uploadRequest.setRequestHeader("Content-Type", contentType);

      uploadRequest.upload.onprogress = (event) => {
        if (!onProgress || !event.lengthComputable) return;

        const percentage = (event.loaded / event.total) * 100;
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage,
        });
      };

      uploadRequest.onload = () => {
        if (uploadRequest.status >= 200 && uploadRequest.status < 300) {
          resolve(
            new Response(null, {
              status: uploadRequest.status,
              statusText: uploadRequest.statusText,
            })
          );
        } else {
          reject(
            new Error(
              `Upload failed with status ${uploadRequest.status}: ${uploadRequest.statusText}`
            )
          );
        }
      };

      uploadRequest.onerror = () => {
        reject(new Error("Network error during upload"));
      };
    });

    uploadRequest.send(file);

    await uploadPromise;

    return {
      success: true,
      url: fileUrl,
      key,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };
  } catch (error: any) {
    console.error("S3 Upload Error:", error);
    return {
      success: false,
      error: error.message || "Failed to upload file to S3",
    };
  }
};

// Multiple files upload
export const uploadMultipleToS3 = async (
  files: File[],
  options: UploadOptions = {},
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadToS3(file, options, (progress) => {
      if (onProgress) {
        onProgress(i, progress);
      }
    });
    results.push(result);
  }

  return results;
};

// Delete file via backend API (accepts either full URL or S3 key)
export const deleteMediaFile = async (
  fileUrlOrKey: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const apiClient = getApiClient();

    await apiClient.delete('/api/users/media', {
      body: JSON.stringify({ fileUrlOrKey }),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Media delete error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete file",
    };
  }
};

// Helper function to extract S3 key from URL
export const extractS3KeyFromUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname.substring(1); // Remove leading slash
  } catch (error) {
    console.error("Error extracting S3 key from URL:", error);
    return null;
  }
};

// Utility function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Utility function to get file extension
export const getFileExtension = (fileName: string): string => {
  return fileName.split(".").pop()?.toLowerCase() || "";
};

// Check if file is an image
export const isImageFile = (file: File): boolean => {
  return ALLOWED_FILE_TYPES.images.includes(file.type);
};

// Check if file is a video
export const isVideoFile = (file: File): boolean => {
  return ALLOWED_FILE_TYPES.videos.includes(file.type);
};

// Generate thumbnail URL
export const generateThumbnailUrl = (
  originalUrl: string,
  _size: string = "150x150"
): string => {
  // This would depend on your thumbnail generation service
  // For now, return the original URL
  return originalUrl;
};

export default {
  uploadToS3,
  uploadMultipleToS3,
  deleteMediaFile,
  extractS3KeyFromUrl,
  formatFileSize,
  getFileExtension,
  isImageFile,
  isVideoFile,
  generateThumbnailUrl,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZES,
};
