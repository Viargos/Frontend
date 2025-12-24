"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";
import PostMediaUploader from "./PostMediaUploader";
import LocationSearch from "@/components/journey/LocationSearch";
import { CreatePostFormData, PostType, MediaType } from "@/types/post.types";
import { postService } from "@/lib/services/service-factory";

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  country?: string;
}
import MapIcon from "@/components/icons/MapIcon";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useJsApiLoader } from "@react-google-maps/api";

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

  const { getCurrentLocation } = useGeolocation();
  const hasAttemptedLocationSet = useRef(false);
  
  // Static libraries array to prevent LoadScript reloading
  const GOOGLE_MAPS_LIBRARIES: 'places'[] = ['places'];
  
  // Load Google Maps API for reverse geocoding
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Reverse geocode coordinates to get location name
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<Location | null> => {
    if (!isLoaded || !window.google) {
      return null;
    }

    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
            const result = results[0];
            const location: Location = {
              id: result.place_id || `current-${lat}-${lng}`,
              name: result.formatted_address || "Current Location",
              latitude: lat,
              longitude: lng,
              address: result.formatted_address,
            };
            resolve(location);
          } else {
            // If geocoding fails, create a location with "Current Location" as name
            const location: Location = {
              id: `current-${lat}-${lng}`,
              name: "Current Location",
              latitude: lat,
              longitude: lng,
              address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
            };
            resolve(location);
          }
        }
      );
    });
  }, [isLoaded]);

  // Set current location on mount (only once)
  useEffect(() => {
    const setCurrentLocation = async () => {
      // Only set if we haven't attempted yet and location is not already set
      if (hasAttemptedLocationSet.current) {
        return;
      }

      // Wait for Google Maps to load
      if (!isLoaded) {
        return;
      }

      hasAttemptedLocationSet.current = true;
      try {
        const coords = await getCurrentLocation();
        if (coords) {
          const location = await reverseGeocode(coords.latitude, coords.longitude);
          if (location) {
            setSelectedLocation(location);
            setFormData((prev) => {
              // Only set if location is not already manually set
              if (prev.location) {
                return prev;
              }
              return {
                ...prev,
                location: location.name,
                latitude: location.latitude,
                longitude: location.longitude,
              };
            });
          }
        }
      } catch (err) {
        // Silently fail - user can still manually select location
        console.log("Could not get current location:", err);
      }
    };

    setCurrentLocation();
  }, [getCurrentLocation, reverseGeocode, isLoaded]);

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

      if (!postResponse.data) {
        throw new Error("Failed to create post: No data returned");
      }

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
