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
import { useRouter } from "next/navigation";

interface Place {
  id: string;
  name: string;
  type: string;
  description?: string;
  address?: string;
  startTime?: string;
  endTime?: string;
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          {/* Cover Image or Gradient */}
          <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 relative">
            {journey.coverImage && (
              <img
                src={journey.coverImage}
                alt={journey.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/40"></div>
            
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Journey Itinerary
              </h2>
              
              {journey.days.map((day, index) => (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Day {day.dayNumber + 1}
                    </h3>
                    <span className="text-sm text-gray-500">{day.date}</span>
                  </div>

                  {day.places && day.places.length > 0 ? (
                    <div className="space-y-3">
                      {day.places.map((place) => (
                        <div
                          key={place.id}
                          className="bg-white rounded-lg p-3 border border-gray-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-lg">
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
                    <div className="mt-3 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-600">📝</span>
                        <div>
                          <h5 className="font-medium text-yellow-800 text-sm">Notes</h5>
                          <p className="text-sm text-yellow-700 mt-1">{day.notes}</p>
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
                This journey doesn't have detailed itinerary information yet.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleViewFullJourney}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            View Full Journey
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
