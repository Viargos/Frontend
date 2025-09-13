"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import { TextArea } from "@/components/ui/TextArea";
import { Post } from "@/types/post.types";
import { CreatePostDto } from "@/types/post.types";
import { postService, journeyService } from "@/lib/services/service-factory";
import { Journey } from "@/types/journey.types";
import JourneyIcon from "@/components/icons/JourneyIcon";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import MapIcon from "@/components/icons/MapIcon";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onSuccess?: (updatedPost: Post) => void;
}

type EditStep = "edit-post" | "select-journey" | "edit-journey-post";

export default function EditPostModal({
  isOpen,
  onClose,
  post,
  onSuccess,
}: EditPostModalProps) {
  const [step, setStep] = useState<EditStep>("edit-post");
  const [description, setDescription] = useState(post.description || "");
  const [location, setLocation] = useState(post.location || "");
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(
    post.journey || null
  );
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingJourneys, setIsLoadingJourneys] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when post changes
  useEffect(() => {
    if (post) {
      setDescription(post.description || "");
      setLocation(post.location || "");
      setSelectedJourney(post.journey || null);
      setStep("edit-post");
      setError(null);
    }
  }, [post]);

  // Load journeys when selecting journey
  useEffect(() => {
    const loadJourneys = async () => {
      if (step === "select-journey") {
        try {
          setIsLoadingJourneys(true);
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
          setIsLoadingJourneys(false);
        }
      }
    };

    loadJourneys();
  }, [step]);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError("Please enter a description for your post.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const updateData: CreatePostDto = {
        description: description.trim(),
        location: location.trim() || undefined,
        journeyId: selectedJourney?.id || undefined,
      };

      const response = await postService.updatePost(post.id, updateData);

      if (response.data) {
        onSuccess?.(response.data);
        onClose();
      }
    } catch (error: any) {
      console.error("Error updating post:", error);
      setError(error.message || "Failed to update post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJourneySelect = (journey: Journey) => {
    setSelectedJourney(journey);
    setStep("edit-journey-post");
  };

  const handleRemoveJourney = () => {
    setSelectedJourney(null);
    setStep("edit-post");
  };

  const handleGoToJourneySelection = () => {
    setStep("select-journey");
  };

  const renderStepContent = () => {
    switch (step) {
      case "edit-post":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <InputField
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where are you?"
                className="w-full"
              />
            </div>

            {/* Journey Link Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">
                  Journey Link
                </h3>
              </div>

              {selectedJourney ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <JourneyIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Linked to Journey
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        {selectedJourney.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {selectedJourney.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>
                            {new Date(
                              selectedJourney.startDate
                            ).toLocaleDateString()}{" "}
                            -
                            {new Date(
                              selectedJourney.endDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        {selectedJourney.destination && (
                          <div className="flex items-center space-x-1">
                            <MapIcon className="w-3 h-3" />
                            <span>{selectedJourney.destination}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveJourney}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <JourneyIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500 mb-4">
                    Link this post to one of your journeys
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleGoToJourneySelection}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    Select Journey
                  </Button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isLoading || !description.trim()}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Post"
                )}
              </Button>
            </div>
          </div>
        );

      case "select-journey":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-4 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("edit-post")}
                className="text-gray-600"
              >
                ← Back
              </Button>
              <h3 className="text-lg font-semibold">Select a Journey</h3>
            </div>

            {isLoadingJourneys ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button variant="outline" onClick={() => setStep("edit-post")}>
                  Go Back
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {journeys.map((journey) => (
                  <motion.div
                    key={journey.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    onClick={() => handleJourneySelect(journey)}
                  >
                    <div className="flex items-start space-x-3">
                      <JourneyIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {journey.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {journey.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="w-3 h-3" />
                            <span>
                              {new Date(journey.startDate).toLocaleDateString()}{" "}
                              -{new Date(journey.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          {journey.destination && (
                            <div className="flex items-center space-x-1">
                              <MapIcon className="w-3 h-3" />
                              <span>{journey.destination}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case "edit-journey-post":
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("select-journey")}
                className="text-gray-600"
              >
                ← Back
              </Button>
              <h3 className="text-lg font-semibold">Edit Journey Post</h3>
            </div>

            {/* Selected Journey Display */}
            {selectedJourney && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <JourneyIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Linked to Journey
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {selectedJourney.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {selectedJourney.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep("select-journey")}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share your experience about this journey..."
                rows={4}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <InputField
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where are you?"
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isLoading || !description.trim()}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Post"
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Post</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">{renderStepContent()}</div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
