// Alternative S3 upload using presigned URLs - more browser-friendly approach
export interface PresignedUploadOptions {
  folder?: string;
  fileType?: 'images' | 'videos' | 'documents';
  maxSize?: number;
  customFileName?: string;
}

export interface PresignedUploadResult {
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

// This function should be called from your backend API
export const getPresignedUploadUrl = async (
  fileName: string,
  fileType: string,
  folder?: string
): Promise<{ success: boolean; presignedUrl?: string; key?: string; error?: string }> => {
  try {
    const response = await fetch('/api/s3/presigned-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        fileType,
        folder,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to get presigned URL'
      };
    }

    return {
      success: true,
      presignedUrl: data.presignedUrl,
      key: data.key
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get presigned URL'
    };
  }
};

// Upload file using presigned URL
export const uploadWithPresignedUrl = async (
  file: File,
  options: PresignedUploadOptions = {},
  onProgress?: (progress: UploadProgress) => void
): Promise<PresignedUploadResult> => {
  try {
    // Generate unique file name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const baseName = file.name.split('.').slice(0, -1).join('.');
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '-');
    
    const fileName = options.customFileName || `${sanitizedBaseName}-${timestamp}-${randomString}.${extension}`;

    // Get presigned URL from backend
    const presignedResult = await getPresignedUploadUrl(fileName, file.type, options.folder);
    
    if (!presignedResult.success) {
      return {
        success: false,
        error: presignedResult.error
      };
    }

    // Upload file using presigned URL with XMLHttpRequest for progress tracking
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          onProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 204) {
          const publicUrl = presignedResult.presignedUrl!.split('?')[0]; // Remove query params to get public URL
          
          resolve({
            success: true,
            url: publicUrl,
            key: presignedResult.key,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          });
        } else {
          resolve({
            success: false,
            error: `Upload failed with status ${xhr.status}`
          });
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        resolve({
          success: false,
          error: 'Network error during upload'
        });
      });

      // Start upload
      xhr.open('PUT', presignedResult.presignedUrl!);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });

  } catch (error: any) {
    console.error('Presigned Upload Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file'
    };
  }
};

// Multiple files upload with presigned URLs
export const uploadMultipleWithPresignedUrl = async (
  files: File[],
  options: PresignedUploadOptions = {},
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<PresignedUploadResult[]> => {
  const results: PresignedUploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadWithPresignedUrl(file, options, (progress) => {
      if (onProgress) {
        onProgress(i, progress);
      }
    });
    results.push(result);
  }

  return results;
};
