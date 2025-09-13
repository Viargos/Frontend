"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";
import PostMediaUploader from "./PostMediaUploader";
import LocationSearch from "@/components/journey/LocationSearch";
import { CreatePostFormData, PostType, MediaType } from "@/types/post.types";
import { Location } from "@/types/journey.types";
import { postService } from "@/lib/services/service-factory";
import MapIcon from "@/components/icons/MapIcon";

interface StandalonePostFormProps {
  onSuccess: (postId: string) => void;
  onCancel: () => void;
}

export default function StandalonePostForm({
  onSuccess,
  onCancel,
}: StandalonePostFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [formData, setFormData] = useState<CreatePostFormData>({
    type: PostType.STANDALONE,
    description: "",
    location: "",
    latitude: undefined,
    longitude: undefined,
    media: [],
  });

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, description: e.target.value }));
    },
    []
  );

  const handleLocationSelect = useCallback((location: Location) => {
    setSelectedLocation(location);
    setFormData((prev) => ({
      ...prev,
      location: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  }, []);

  const handleMediaChange = useCallback(
    (mediaItems: { id: string; url: string; name: string; type: string }[]) => {
      const formMediaItems = mediaItems.map((item) => ({
        file: new File([], item.name),
        type: item.type.startsWith("image/")
          ? MediaType.IMAGE
          : MediaType.VIDEO,
        preview: item.url,
      }));
      setFormData((prev) => ({ ...prev, media: formMediaItems }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!formData.description.trim()) {
      setError("Description is required");
      return;
    }

    if (!formData.location) {
      setError("Location is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create the post
      const postResponse = await postService.createPost({
        description: formData.description,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      // Add media if any
      if (formData.media.length > 0) {
        for (let i = 0; i < formData.media.length; i++) {
          const mediaItem = formData.media[i];
          await postService.addMediaToPost(postResponse.data.id, {
            type: mediaItem.type,
            url: mediaItem.preview,
            order: i,
          });
        }
      }

      onSuccess(postResponse.data.id);
    } catch (error: any) {
      setError(error.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  }, [formData, onSuccess]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location *
        </label>
        <LocationSearch
          onLocationSelect={handleLocationSelect}
          placeholder="Search for a location..."
        />
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapIcon className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  {selectedLocation.name}
                </p>
                <p className="text-xs text-green-600">
                  {selectedLocation.address}
                </p>
                {selectedLocation.country && (
                  <p className="text-xs text-green-600">
                    {selectedLocation.country}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <TextArea
          placeholder="Share your experience at this location..."
          value={formData.description}
          onChange={handleDescriptionChange}
          rows={4}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Media (Optional)
        </label>
        <PostMediaUploader
          onMediaChange={handleMediaChange}
          maxFiles={10}
          className="w-full"
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-3"
        >
          <p className="text-red-700 text-sm">{error}</p>
        </motion.div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={
            loading ||
            !formData.description ||
            !formData.description.trim() ||
            !formData.location
          }
        >
          {loading ? "Creating..." : "Create Post"}
        </Button>
      </div>
    </div>
  );
}
