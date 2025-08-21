import React, { useRef } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useMediaUpload } from "@/hooks/useMediaUpload";

interface CoverImageProps {
  imageUrl: string | null;
  onImageUpload: (url: string, key?: string) => void;
  journeyName?: string;
  subtitle?: string;
  onJourneyNameChange?: (name: string) => void;
  onSubtitleChange?: (subtitle: string) => void;
}

export const CoverImage: React.FC<CoverImageProps> = ({
  imageUrl,
  onImageUpload,
  journeyName = "",
  subtitle = "",
  onJourneyNameChange,
  onSubtitleChange,
}) => {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { uploadSingle, isUploading } = useMediaUpload();

  const handleCoverUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadSingle(file, {
        folder: "journey-covers",
        fileType: "images",
      });

      if (result.success && result.url && result.key) {
        onImageUpload(result.url, result.key);
      } else {
        console.error("Failed to upload cover image:", result.error);
      }
    } catch (error) {
      console.error("Failed to upload cover image:", error);
    }

    // Reset the input to allow re-selecting the same file
    if (event.target) {
      event.target.value = "";
    }
  };

  return (
    <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden">
      {/* Background Image */}
      <img
        src={imageUrl || "/london.png?format=webp&width=800"}
        alt="Journey destination"
        className="w-full h-full object-cover"
      />

      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6">
        {/* Journey Name Input */}
        <div className="w-full max-w-2xl mb-4">
          <input
            type="text"
            value={journeyName}
            onChange={(e) => onJourneyNameChange?.(e.target.value)}
            placeholder="Enter journey name..."
            className="w-full text-center text-2xl sm:text-3xl lg:text-4xl font-bold bg-transparent border-none outline-none placeholder-white/70 text-white"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.7)" }}
          />
        </div>

        {/* Subtitle Input */}
        <div className="w-full max-w-xl">
          <input
            type="text"
            value={subtitle}
            onChange={(e) => onSubtitleChange?.(e.target.value)}
            placeholder="Add a subtitle..."
            className="w-full text-center text-sm sm:text-base lg:text-lg bg-transparent border-none outline-none placeholder-white/60 text-white/90"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.7)" }}
          />
        </div>
      </div>

      {/* Change Cover Button */}
      <button
        onClick={() => coverInputRef.current?.click()}
        disabled={isUploading}
        className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-md text-sm hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isUploading ? (
          <>
            <LoadingSpinner size="sm" />
            Uploading...
          </>
        ) : (
          <>
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Change Cover
          </>
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
