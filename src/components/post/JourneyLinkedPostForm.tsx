"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import { TextArea } from "@/components/ui/TextArea";
import PostMediaUploader from "./PostMediaUploader";
import { Journey } from "@/types/journey.types";
import { CreatePostFormData, PostType, MediaType } from "@/types/post.types";
import { journeyService, postService } from "@/lib/services/service-factory";
import JourneyIcon from "@/components/icons/JourneyIcon";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import MapIcon from "@/components/icons/MapIcon";

interface JourneyLinkedPostFormProps {
  onSuccess: (postId: string) => void;
  onCancel: () => void;
}

type Step = "select-journey" | "create-content" | "review";

export default function JourneyLinkedPostForm({
  onSuccess,
  onCancel,
}: JourneyLinkedPostFormProps) {
  const [step, setStep] = useState<Step>("select-journey");
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [formData, setFormData] = useState<CreatePostFormData>({
    type: PostType.JOURNEY_LINKED,
    description: "",
    journeyId: "",
    media: [],
  });

  // Load user's journeys
  useEffect(() => {
    const loadJourneys = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await journeyService.getMyJourneys();

        if (Array.isArray(response)) {
          setJourneys(response);
          if (response.length === 0) {
            setError(
              "No journeys found. Create a journey first to link posts to it."
            );
          }
        } else {
          setError("Invalid response format from server");
        }
      } catch (error: any) {
        setError(error.message || "Failed to load journeys");
      } finally {
        setLoading(false);
      }
    };

    if (step === "select-journey") {
      loadJourneys();
    }
  }, [step]);

  const handleJourneySelect = useCallback((journey: Journey) => {
    setSelectedJourney(journey);
    setFormData((prev) => ({
      ...prev,
      journeyId: journey.id,
    }));
    setStep("create-content");
  }, []);

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, description: e.target.value }));
    },
    []
  );

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
    if (!formData.description || !formData.description.trim()) {
      setError("Description is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create the post
      const postResponse = await postService.createPost({
        description: formData.description,
        journeyId: formData.journeyId,
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

  const renderStepContent = () => {
    switch (step) {
      case "select-journey":
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select a Journey
              </h3>
              <p className="text-gray-600 text-sm">
                Choose which journey you'd like to link this post with
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button variant="secondary" onClick={() => setError(null)}>
                  Try Again
                </Button>
              </div>
            ) : journeys.length === 0 ? (
              <div className="text-center py-8">
                <JourneyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  You don't have any journeys yet
                </p>
                <Button variant="secondary" onClick={onCancel}>
                  Create Journey First
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {journeys.map((journey) => (
                  <motion.button
                    key={journey.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleJourneySelect(journey)}
                    className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left"
                  >
                    <div className="flex items-start space-x-3">
                      {journey.coverImage ? (
                        <img
                          src={journey.coverImage}
                          alt={journey.title}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <JourneyIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {journey.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {journey.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            {new Date(journey.createdAt).toLocaleDateString()}
                          </div>
                          {journey.days && (
                            <div className="flex items-center">
                              <MapIcon className="w-3 h-3 mr-1" />
                              {journey.days.length} day
                              {journey.days.length !== 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        );

      case "create-content":
        return (
          <div className="space-y-6">
            {selectedJourney && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  {selectedJourney.coverImage ? (
                    <img
                      src={selectedJourney.coverImage}
                      alt={selectedJourney.title}
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                      <JourneyIcon className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      Linked to: {selectedJourney.title}
                    </p>
                    <p className="text-xs text-blue-600">
                      {selectedJourney.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <TextArea
                placeholder="Share your thoughts about this journey..."
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="secondary"
                onClick={() => setStep("select-journey")}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !formData.description ||
                  !formData.description.trim()
                }
              >
                {loading ? "Creating..." : "Create Post"}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="space-y-6">{renderStepContent()}</div>;
}
