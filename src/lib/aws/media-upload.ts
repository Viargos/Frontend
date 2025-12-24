// NOTE:
// This frontend module no longer talks directly to AWS S3 or uses any AWS credentials.
// All sensitive configuration lives in the backend. The frontend only:
// 1) Asks the backend for a pre-signed upload URL
// 2) Uploads the file to that URL with a standard fetch PUT request

// API base URL for backend requests (used only for direct fetch fallbacks)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ✅ Use existing token service so we NEVER expose AWS keys in the frontend
// and rely solely on backend JWT-protected endpoints.
import { tokenSvc } from "@/lib/services/service-factory";

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

    // 1) Ask backend for a pre-signed URL
    //    This call is authenticated with the user's JWT and the backend
    //    uses AWS credentials from environment variables ONLY.
    const token = tokenSvc.getToken();

    // If there is no token at all, short‑circuit with a clear auth error
    if (!token) {
      console.warn("Upload blocked: no auth token found for /users/upload-url");
      return {
        success: false,
        error: "You must be signed in to upload media. Please log in and try again.",
      };
    }

    const presignResponse = await fetch(`${API_BASE_URL}/users/upload-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        fileName,
        contentType,
        folder: options.folder,
      }),
    });

    if (!presignResponse.ok) {
      const rawText = await presignResponse.text();

      // Try to parse JSON error from backend so we can detect auth failures
      try {
        const parsed: any = rawText ? JSON.parse(rawText) : null;
        const statusCode = parsed?.statusCode;
        const message = parsed?.message;

        // Backend uses statusCode 10001 for generic auth failure
        if (statusCode === 10001 || presignResponse.status === 401) {
          console.warn("Upload URL request unauthorized:", parsed);
          return {
            success: false,
            error:
              "Your session has expired or you are not authorized. Please sign in again and retry the upload.",
          };
        }

        return {
          success: false,
          error:
            message ||
            "Failed to obtain upload URL from server. Please try again.",
        };
      } catch {
        // Fallback if response is not JSON
        return {
          success: false,
          error:
            rawText ||
            "Failed to obtain upload URL from server. Please try again.",
        };
      }
    }

    // Safely parse response and support both direct and wrapped formats:
    // - { uploadUrl, fileUrl, key }
    // - { statusCode, message, data: { uploadUrl, fileUrl, key } }
    const rawJson: any = await presignResponse.json();
    const payload =
      rawJson && typeof rawJson === "object" && rawJson.data
        ? rawJson.data
        : rawJson;

    const uploadUrl: string | undefined = payload?.uploadUrl;
    const key: string | undefined = payload?.key;
    // Some backends may not return a public fileUrl and only return the S3 key.
    // In that case, derive the final public URL from the known bucket and key.
    let fileUrl: string | undefined = payload?.fileUrl;
    if (key && !fileUrl) {
      fileUrl = `https://viargos.s3.us-east-2.amazonaws.com/${key}`;
    }

    if (!uploadUrl || !key) {
      console.error("Invalid upload URL response payload:", rawJson);
      return {
        success: false,
        error: "Server did not return a valid upload URL.",
      };
    }

    // 2) Upload the file directly to S3 using the pre-signed URL
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
    const token = tokenSvc.getToken();
    if (!token) {
      return {
        success: false,
        error: "You must be logged in to delete media files.",
      };
    }

    const response = await fetch(`${API_BASE_URL}/users/media`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fileUrlOrKey }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: errorText || "Failed to delete file",
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Media delete error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete file",
    };
  }
};

// Helper function to extract S3 key from URL (still useful for mapping)
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

// Generate thumbnail URL (assuming you have a thumbnail generation service)
export const generateThumbnailUrl = (
  originalUrl: string,
  size: string = "150x150"
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
