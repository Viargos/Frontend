"use client";

import { motion } from "framer-motion";
import {
  X,
  MapPin,
  Calendar,
  User,
  Clock,
  ArrowRight,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { JourneyMedia } from "@/types/journey.types";
import { useRouter } from "next/navigation";

interface Place {
  id: string;
  name: string;
  type: string;
  description?: string;
  address?: string;
  startTime?: string;
  endTime?: string;
   media?: JourneyMedia[];
}

interface Day {
  id: string;
  dayNumber: number;
  date: string;
  places?: Place[];
  notes?: string;
}

interface Journey {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
  days?: Day[];
  distance?: number;
  category?: string;
  coverImage?: string;
}

interface JourneyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  journey: Journey | null;
}

export default function JourneyDetailsModal({
  isOpen,
  onClose,
  journey,
}: JourneyDetailsModalProps) {
  const router = useRouter();

  if (!journey) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPlaceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "stay":
        return "🏨";
      case "activity":
        return "🎯";
      case "food":
        return "🍽️";
      case "transport":
        return "🚗";
      case "note":
        return "📝";
      default:
        return "📍";
    }
  };

  const getTotalPlaces = () => {
    if (!journey.days) return 0;
    return journey.days.reduce(
      (total, day) => total + (day.places?.length || 0),
      0
    );
  };

  const handleViewFullJourney = () => {
    router.push(`/journey/${journey.id}`);
    onClose();
  };

  // Helper to convert S3 key to full URL
  const getCoverImageUrl = (coverImage: string | null | undefined): string | null => {
    if (!coverImage) return null;
    if (coverImage.startsWith('http')) return coverImage;
    return `https://viargos-sandbox.s3.us-east-2.amazonaws.com/${coverImage}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          {/* Cover Image or Gradient */}
          <div className="h-48 bg-gradient-to-br from-[#160E53] via-[#001456] to-[#0891b2] relative">
            {getCoverImageUrl(journey.coverImage) && (
              <img
                src={getCoverImageUrl(journey.coverImage)!}
                alt={journey.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50"></div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title Overlay */}
            <div className="absolute inset-0 flex items-center justify-center text-center px-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                  {journey.title}
                </h1>
                {journey.description && (
                  <p className="text-white/90 text-lg drop-shadow-md max-w-2xl">
                    {journey.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Journey Stats Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium">{journey.user.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(journey.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{getTotalPlaces()} places</span>
              </div>
              {journey.days && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{journey.days.length} days</span>
                </div>
              )}
              {journey.distance && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{journey.distance.toFixed(1)}km away</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {journey.days && journey.days.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-0.5 w-8 bg-gradient-to-r from-[#160E53] to-[#0891b2] rounded"></div>
                <h2 className="text-xl font-bold text-[#160E53]">
                  Journey Itinerary
                </h2>
                <div className="h-0.5 flex-1 bg-gradient-to-r from-[#0891b2] to-transparent rounded"></div>
              </div>
              
              {journey.days.map((day, index) => (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-[#160E53]/5 rounded-xl p-5 border border-gray-200 hover:border-[#160E53]/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#160E53] to-[#001456] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {day.dayNumber + 1}
                      </div>
                      <h3 className="text-lg font-bold text-[#160E53]">
                        Day {day.dayNumber + 1}
                      </h3>
                    </div>
                    <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full">{day.date}</span>
                  </div>

                  {day.places && day.places.length > 0 ? (
                    <div className="space-y-3">
                      {day.places.map((place) => (
                        <div
                          key={place.id}
                          className="bg-white rounded-lg p-4 border border-gray-200 hover:border-[#160E53]/40 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-[#160E53] to-[#0891b2] rounded-lg flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                              {getPlaceTypeIcon(place.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {place.name}
                              </h4>
                              {place.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {place.description}
                                </p>
                              )}
                              {place.address && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{place.address}</span>
                                </div>
                              )}
                              {(place.startTime || place.endTime) && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {place.startTime && place.endTime
                                      ? `${place.startTime} - ${place.endTime}`
                                      : place.startTime || place.endTime}
                                  </span>
                                </div>
                              )}

                              {/* Media gallery (images & videos) */}
                              {Array.isArray(place.media) && place.media.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {place.media
                                    .slice()
                                    .sort(
                                      (a, b) =>
                                        (a.order ?? 0) - (b.order ?? 0),
                                    )
                                    .map((media, index) => {
                                      if (!media || !media.url) {
                                        console.log(
                                          "[JOURNEY_MEDIA_RENDER] Skipping invalid media item",
                                          { index, media },
                                        );
                                        return null;
                                      }

                                      const mediaType = typeof media.type === "string"
                                        ? media.type.toLowerCase()
                                        : "";

                                      if (mediaType === "video") {
                                        console.log(
                                          "[JOURNEY_MEDIA_RENDER] Rendering video",
                                          { url: media.url },
                                        );
                                        return (
                                          <video
                                            key={`${place.id}-media-${index}`}
                                            src={media.url}
                                            controls
                                            poster={media.thumbnailUrl}
                                            className="w-40 h-24 rounded-lg object-cover bg-black"
                                          />
                                        );
                                      }

                                      console.log(
                                        "[JOURNEY_MEDIA_RENDER] Rendering image",
                                        { url: media.url },
                                      );
                                      return (
                                        <img
                                          key={`${place.id}-media-${index}`}
                                          src={media.url}
                                          alt={place.name}
                                          className="w-24 h-24 rounded-lg object-cover"
                                        />
                                      );
                                    })}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      No places added for this day
                    </p>
                  )}

                  {day.notes && (
                    <div className="mt-3 bg-[#FFCF56]/10 rounded-lg p-3 border border-[#FFCF56]/30">
                      <div className="flex items-start gap-2">
                        <span className="text-xl">📝</span>
                        <div>
                          <h5 className="font-semibold text-[#160E53] text-sm">Notes</h5>
                          <p className="text-sm text-gray-700 mt-1">{day.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No itinerary available
              </h3>
              <p className="text-gray-600">
                This journey does not have detailed itinerary information yet.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-[#160E53]/5 px-6 py-4 flex justify-between items-center rounded-b-xl border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#160E53] transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={handleViewFullJourney}
            className="px-5 py-2.5 bg-gradient-to-r from-[#160E53] to-[#001456] text-white rounded-lg hover:from-[#001456] hover:to-[#160E53] transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl font-medium"
          >
            View Full Journey
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
