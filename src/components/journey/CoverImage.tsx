import React, { useRef, useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CoverImageProps {
  coverImageUrl: string | null;
  onImageChange: (url: string | null) => void;
}

export const CoverImage: React.FC<CoverImageProps> = ({ 
  coverImageUrl, 
  onImageChange 
}) => {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create a temporary URL for immediate display
      const temporaryUrl = URL.createObjectURL(file);
      onImageChange(temporaryUrl);

      // Here you would typically upload to your server/cloud storage
      // For now, we'll simulate an upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Cover image uploaded:', file.name);
    } catch (error) {
      console.error('Failed to upload cover image:', error);
      onImageChange(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative w-full flex-1">
      <img
        src={coverImageUrl || "/london.png?format=webp&width=800"}
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
