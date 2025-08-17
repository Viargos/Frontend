import React, { useRef } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useMediaUpload } from '@/hooks/useMediaUpload';

interface CoverImageProps {
  imageUrl: string | null;
  onImageUpload: (url: string, key?: string) => void;
}

export const CoverImage: React.FC<CoverImageProps> = ({ 
  imageUrl, 
  onImageUpload 
}) => {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { uploadSingle, isUploading } = useMediaUpload();

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadSingle(file, {
        folder: 'journey-covers',
        fileType: 'images',
      });

      if (result.success && result.url && result.key) {
        onImageUpload(result.url, result.key);
      } else {
        console.error('Failed to upload cover image:', result.error);
      }
    } catch (error) {
      console.error('Failed to upload cover image:', error);
    }

    // Reset the input to allow re-selecting the same file
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className="relative w-full flex-1">
      <img
        src={imageUrl || "/london.png?format=webp&width=800"}
        alt="Journey destination"
        className="w-full h-full rounded-lg object-cover"
      />
      
      {/* Change Cover Button */}
      <button
        onClick={() => coverInputRef.current?.click()}
        disabled={isUploading}
        className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-md text-sm hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isUploading ? (
          <>
            <LoadingSpinner size="sm" />
            Uploading...
          </>
        ) : (
          'Change Cover'
        )}
      </button>
      
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverUpload}
        disabled={isUploading}
      />
    </div>
  );
};
