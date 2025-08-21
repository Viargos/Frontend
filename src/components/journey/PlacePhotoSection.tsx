import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import ImagePlusIcon from "@/components/icons/ImagePlusIcon";
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
  const { deleteFile } = useMediaUpload();

  // Handle photos uploaded from the modal
  const handlePhotosUploaded = (photoKeys: string[]) => {
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
            {photos.map((photoKey, index) => (
              <motion.div
                key={photoKey}
                className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={
                    photoKey.startsWith("http")
                      ? photoKey
                      : `https://viargos.s3.us-east-2.amazonaws.com/${photoKey}`
                  }
                  alt={`Place photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <motion.button
                    onClick={() => handleRemovePhoto(index, photoKey)}
                    className="p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Remove photo"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            ))}
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
