"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { PostType, CreatePostFormData } from "@/types/post.types";
import JourneyIcon from "@/components/icons/JourneyIcon";
import MapIcon from "@/components/icons/MapIcon";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import JourneyLinkedPostForm from "./JourneyLinkedPostForm";
import StandalonePostForm from "./StandalonePostForm";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (postId: string) => void;
}

type Step = "select-type" | "create-post";

export default function CreatePostModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePostModalProps) {
  const [step, setStep] = useState<Step>("select-type");
  const [selectedType, setSelectedType] = useState<PostType | null>(null);

  const handleClose = useCallback(() => {
    setStep("select-type");
    setSelectedType(null);
    onClose();
  }, [onClose]);

  const handleTypeSelect = useCallback((type: PostType) => {
    setSelectedType(type);
    setStep("create-post");
  }, []);

  const handleBack = useCallback(() => {
    setStep("select-type");
    setSelectedType(null);
  }, []);

  const handleSuccess = useCallback(
    (postId: string) => {
      handleClose();
      onSuccess?.(postId);
    },
    [handleClose, onSuccess]
  );

  const renderStepContent = () => {
    switch (step) {
      case "select-type":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create New Post
              </h2>
              <p className="text-gray-600">
                Choose how you'd like to create your post
              </p>
            </div>

            <div className="space-y-4">
              {/* Journey Linked Option */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTypeSelect(PostType.JOURNEY_LINKED)}
                className="w-full p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <JourneyIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Link with Journey
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Create a post linked to one of your existing journeys.
                      Perfect for sharing highlights and memories from your
                      travels.
                    </p>
                    <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
                      <span>Select from your journeys</span>
                      <svg
                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* Standalone Option */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTypeSelect(PostType.STANDALONE)}
                className="w-full p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <MapIcon className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Post Separately
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Create an independent post with its own location. Great
                      for sharing individual moments and experiences.
                    </p>
                    <div className="mt-3 flex items-center text-green-600 text-sm font-medium">
                      <span>Add location and media</span>
                      <svg
                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </motion.div>
        );

      case "create-post":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 mb-6">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedType === PostType.JOURNEY_LINKED
                    ? "Link with Journey"
                    : "Create Standalone Post"}
                </h2>
                <p className="text-gray-600 text-sm">
                  {selectedType === PostType.JOURNEY_LINKED
                    ? "Select a journey and add your content"
                    : "Add location, media, and description"}
                </p>
              </div>
            </div>

            {selectedType === PostType.JOURNEY_LINKED ? (
              <JourneyLinkedPostForm
                onSuccess={handleSuccess}
                onCancel={handleBack}
              />
            ) : (
              <StandalonePostForm
                onSuccess={handleSuccess}
                onCancel={handleBack}
              />
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <div className="p-6 overflow-y-auto max-h-[90vh]">
            {renderStepContent()}
          </div>
        </AnimatePresence>
      </div>
    </Modal>
  );
}
