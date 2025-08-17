import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// AWS Configuration
const AWS_CONFIG = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
  // Add browser-specific configuration to prevent stream issues
  requestHandler: {
    // Use fetch-based request handler for browser compatibility
    requestTimeout: 30000,
  },
};

const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || '';

// Initialize S3 Client with browser-compatible settings
const s3Client = new S3Client(AWS_CONFIG);

// File type configurations
const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  videos: ['video/mp4', 'video/webm', 'video/mpeg', 'video/quicktime'],
  documents: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

const MAX_FILE_SIZES = {
  images: 10 * 1024 * 1024, // 10MB
  videos: 100 * 1024 * 1024, // 100MB
  documents: 5 * 1024 * 1024, // 5MB
};

export interface UploadOptions {
  folder?: string;
  fileType?: 'images' | 'videos' | 'documents';
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
const validateFile = (file: File, options: UploadOptions): { isValid: boolean; error?: string } => {
  // Check file type
  if (options.fileType) {
    const allowedTypes = ALLOWED_FILE_TYPES[options.fileType];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }
  }

  // Check file size
  const maxSize = options.maxSize || MAX_FILE_SIZES[options.fileType || 'images'];
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      error: `File size ${Math.round(file.size / (1024 * 1024))}MB exceeds maximum allowed size of ${maxSizeMB}MB`
    };
  }

  return { isValid: true };
};

const generateUniqueFileName = (originalName: string, folder?: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '-');
  
  const fileName = `${sanitizedBaseName}-${timestamp}-${randomString}.${extension}`;
  
  return folder ? `${folder}/${fileName}` : fileName;
};

const getContentType = (file: File): string => {
  return file.type || 'application/octet-stream';
};

// Main upload function
export const uploadToS3 = async (
  file: File,
  options: UploadOptions = {},
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    // Validate environment variables
    if (!BUCKET_NAME || !AWS_CONFIG.credentials.accessKeyId || !AWS_CONFIG.credentials.secretAccessKey) {
      return {
        success: false,
        error: 'AWS configuration is missing. Please check environment variables.'
      };
    }

    // Validate file
    const validation = validateFile(file, options);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Generate unique file name
    const fileName = options.customFileName || generateUniqueFileName(file.name, options.folder);
    const contentType = getContentType(file);

    // Convert File to ArrayBuffer for better browser compatibility
    const fileBuffer = await file.arrayBuffer();
    
    // Create upload command
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: new Uint8Array(fileBuffer), // Use Uint8Array instead of File directly
      ContentType: contentType,
      ContentLength: file.size,
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Upload progress tracking (simulated since AWS SDK doesn't provide real-time progress for browser uploads)
    if (onProgress) {
      const progressInterval = setInterval(() => {
        // Simulate progress - in real implementation you might use a different approach
        onProgress({
          loaded: file.size * Math.random(),
          total: file.size,
          percentage: Math.min(95, Math.random() * 95)
        });
      }, 100);

      // Clear interval after upload
      setTimeout(() => clearInterval(progressInterval), 1000);
    }

    // Execute upload
    const response = await s3Client.send(uploadCommand);

    // Final progress update
    if (onProgress) {
      onProgress({
        loaded: file.size,
        total: file.size,
        percentage: 100
      });
    }

    // Generate public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.${AWS_CONFIG.region}.amazonaws.com/${fileName}`;

    return {
      success: true,
      url: publicUrl,
      key: fileName,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    };

  } catch (error: any) {
    console.error('S3 Upload Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file to S3'
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

// Delete file from S3
export const deleteFromS3 = async (key: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!BUCKET_NAME || !AWS_CONFIG.credentials.accessKeyId || !AWS_CONFIG.credentials.secretAccessKey) {
      return {
        success: false,
        error: 'AWS configuration is missing. Please check environment variables.'
      };
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(deleteCommand);

    return { success: true };
  } catch (error: any) {
    console.error('S3 Delete Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete file from S3'
    };
  }
};

// Get presigned URL for secure access (optional)
export const getPresignedUrl = async (
  key: string,
  expiresIn: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    if (!BUCKET_NAME) {
      return {
        success: false,
        error: 'S3 bucket name is missing'
      };
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

    return {
      success: true,
      url: signedUrl
    };
  } catch (error: any) {
    console.error('Presigned URL Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate presigned URL'
    };
  }
};

// Helper function to extract S3 key from URL
export const extractS3KeyFromUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    
    // Handle different S3 URL formats
    if (parsedUrl.hostname.includes('s3.amazonaws.com')) {
      // https://bucket-name.s3.region.amazonaws.com/key
      return parsedUrl.pathname.substring(1); // Remove leading slash
    } else if (parsedUrl.hostname === 's3.amazonaws.com') {
      // https://s3.amazonaws.com/bucket-name/key
      const pathParts = parsedUrl.pathname.substring(1).split('/');
      return pathParts.slice(1).join('/'); // Remove bucket name
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting S3 key from URL:', error);
    return null;
  }
};

// Utility function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Utility function to get file extension
export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
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
export const generateThumbnailUrl = (originalUrl: string, size: string = '150x150'): string => {
  // This would depend on your thumbnail generation service
  // For now, return the original URL
  return originalUrl;
};

export default {
  uploadToS3,
  uploadMultipleToS3,
  deleteFromS3,
  getPresignedUrl,
  extractS3KeyFromUrl,
  formatFileSize,
  getFileExtension,
  isImageFile,
  isVideoFile,
  generateThumbnailUrl,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZES,
};
