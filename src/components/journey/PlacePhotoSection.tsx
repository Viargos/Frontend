import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import ImagePlusIcon from "@/components/icons/ImagePlusIcon";
import { TrashIcon } from "@/components/icons";
import PhotoUploadModal from "@/components/media/PhotoUploadModal";

interface PlacePhotoSectionProps {
  photos: string[];
  placeId: string; // Unique identifier for this place to handle uploads
  onAddPhoto: (photoKey: string) => void;
  onRemovePhoto: (photoIndex: number) => void;
}

export const PlacePhotoSection: React.FC<PlacePhotoSectionProps> = ({
  photos,
  placeId,
  onAddPhoto,
  onRemovePhoto,
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const { deleteFile } = useMediaUpload();

  // Handle photos uploaded from the modal
  const handlePhotosUploaded = (photoKeys: string[]) => {
    console.log("Photos uploaded for place:", {
      placeId,
      photoKeys,
    });
    photoKeys.forEach((key) => onAddPhoto(key));
    setShowUploadModal(false);
  };

  const handleRemovePhoto = async (index: number, photoKey: string) => {
    try {
      await deleteFile(photoKey);
      onRemovePhoto(index);
    } catch (error) {
      console.error("Failed to delete photo:", error);
      // Still remove from UI even if S3 deletion fails
      onRemovePhoto(index);
    }
  };

  const handleImageLoad = (photoKey: string) => {
    console.log('✅ Image loaded successfully:', photoKey);
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(photoKey);
      return newSet;
    });
  };

  const handleImageError = (photoKey: string, url: string) => {
    console.error('❌ Failed to load image:', { photoKey, url });
    setFailedImages(prev => new Set(prev).add(photoKey));
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(photoKey);
      return newSet;
    });
  };

  const getImageUrl = (photoKey: string) => {
    const url = photoKey.startsWith("http")
      ? photoKey
      : `https://viargos.s3.us-east-2.amazonaws.com/${photoKey}`;
    console.log('🖼️ Loading image:', { photoKey, url });
    return url;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-black">Photos</label>
        <motion.button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-blue border border-primary-blue rounded-md hover:bg-blue-50 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ImagePlusIcon className="w-4 h-4" />
          Add Photo
        </motion.button>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AnimatePresence>
            {photos.map((photoKey, index) => {
              if (!photoKey) return null;
              const imageUrl = getImageUrl(photoKey);
              const hasFailed = failedImages.has(photoKey);
              
              return (
              <motion.div
                key={photoKey}
                className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {/* Failed State */}
                {hasFailed && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400 z-10">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xs">Failed to load</p>
                  </div>
                )}

                {/* Image - Always visible, just let it load naturally */}
                <img
                  src={imageUrl}
                  alt={`Place photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={() => handleImageLoad(photoKey)}
                  onError={() => handleImageError(photoKey, imageUrl)}
                  loading="lazy"
                />

                {/* Remove Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <motion.button
                    onClick={() => handleRemovePhoto(index, photoKey)}
                    className="p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Remove photo"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
<TrashIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onPhotosUploaded={handlePhotosUploaded}
      />
    </div>
  );
};
