"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  ArrowUpRight,
  Sparkles,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Journey } from "@/types/journey.types";
import { useRouter } from "next/navigation";

interface ProfileJourneyCardProps {
  journey: Journey;
  index: number;
  onDelete?: (journeyId: string) => void;
}

export default function ProfileJourneyCard({
  journey,
  index,
  onDelete,
}: ProfileJourneyCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    router.push(`/journey/${journey.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(journey.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete journey:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowDeleteConfirm(false);
  };

  const formatDateRange = () => {
    if (!journey.days || journey.days.length === 0) {
      return "No dates set";
    }

    const firstDay = new Date(journey.days[0].date);
    const lastDay = new Date(journey.days[journey.days.length - 1].date);

    const formatOptions: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };

    if (journey.days.length === 1) {
      return firstDay.toLocaleDateString("en-GB", formatOptions);
    }

    // Same month and year
    if (
      firstDay.getMonth() === lastDay.getMonth() &&
      firstDay.getFullYear() === lastDay.getFullYear()
    ) {
      return `${firstDay.getDate()} - ${lastDay.toLocaleDateString(
        "en-GB",
        formatOptions
      )}`;
    }

    return `${firstDay.toLocaleDateString(
      "en-GB",
      formatOptions
    )} • ${lastDay.toLocaleDateString("en-GB", formatOptions)}`;
  };

  const getLocationFromJourney = () => {
    if (journey.days && journey.days.length > 0) {
      const firstDay = journey.days[0];
      if (firstDay.places && firstDay.places.length > 0) {
        const location = firstDay.places[0].location;
        // Extract city/country from location
        const parts = location.split(",");
        if (parts.length >= 2) {
          return parts[parts.length - 1].trim(); // Get country/last part
        }
        return location;
      }
    }
    return "Unknown location";
  };

  const getJourneyImage = () => {
    // Try to get image from journey days/places
    if (journey.days && journey.days.length > 0) {
      for (const day of journey.days) {
        if (day.places && day.places.length > 0) {
          for (const place of day.places) {
            if (place.images && place.images.length > 0) {
              return place.images[0];
            }
          }
        }
      }
    }
    // Fallback to a placeholder or journey-specific image
    return null;
  };

  const getJourneyStatus = () => {
    // Simple logic: if journey has days with places, it's completed
    if (journey.days && journey.days.length > 0) {
      const hasPlaces = journey.days.some(
        (day) => day.places && day.places.length > 0
      );
      return hasPlaces ? "completed" : "ongoing";
    }
    return "ongoing";
  };

  const getHighlight = () => {
    // Find the most interesting place or activity
    if (journey.days && journey.days.length > 0) {
      for (const day of journey.days) {
        if (day.places && day.places.length > 0) {
          const interestingPlace = day.places.find(
            (place) =>
              place.name.toLowerCase().includes("tower") ||
              place.name.toLowerCase().includes("museum") ||
              place.name.toLowerCase().includes("palace") ||
              place.name.toLowerCase().includes("temple") ||
              place.name.toLowerCase().includes("monument")
          );
          if (interestingPlace) {
            return interestingPlace.name;
          }
        }
      }
    }
    return null;
  };

  const journeyImage = getJourneyImage();
  const status = getJourneyStatus();
  const highlight = getHighlight();
  const location = getLocationFromJourney();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        damping: 25,
        stiffness: 200,
      }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={handleClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 h-full"
    >
      <div className="flex flex-col h-full p-4">
        {/* Journey Image */}
        <div className="relative w-full h-[200px] rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex-shrink-0 mb-4">
          {journeyImage && !imageError ? (
            <img
              src={journeyImage}
              alt={journey.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-medium text-gray-500">Journey</div>
              </div>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Delete Button - positioned on image */}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-red-500 hover:text-red-600 shadow-md z-10"
              title="Delete journey"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Header */}
          <div className="space-y-3">
            {/* Date Range */}
            <div className="text-sm font-semibold text-indigo-600">
              {formatDateRange()}
            </div>

            {/* Title and Arrow */}
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2 flex-1 pr-4">
                {journey.title}
              </h3>
              {/* Arrow */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">
                {location}
              </span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-4">
            {/* Status Badge */}
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                status === "completed"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-yellow-100 text-yellow-700 border border-yellow-200"
              }`}
            >
              {status === "completed" ? "Completed" : "Ongoing"}
            </div>

            {/* Highlight Badge */}
            {highlight && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                <Sparkles className="w-3 h-3" />
                <span
                  className="truncate max-w-[120px]"
                  title={`Highlight: ${highlight}`}
                >
                  Highlight:{" "}
                  {highlight.length > 15
                    ? `${highlight.substring(0, 15)}...`
                    : highlight}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleCancelDelete}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Journey
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium">"{journey.title}"</span>? This will
              permanently remove the journey and all its data.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Journey
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
