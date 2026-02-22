'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Clock, Hotel, Trees, UtensilsCrossed, Car, FileText, Image as ImageIcon } from 'lucide-react';
import { CreateJourneyPlace, PlaceType } from '@/types/journey.types';
import { JourneyFormData } from '@/hooks/useJourneyForm';
import Image from 'next/image';
import JourneyMap from '@/components/maps/JourneyMap';

interface JourneyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: JourneyFormData;
  journeyPlaces: { [key: string]: CreateJourneyPlace[] };
  days: string[];
  getDateForDay: (dayLabel: string) => string;
  isSubmitting: boolean;
  isEditMode?: boolean; // New prop to distinguish between create and edit
}

const PlaceTypeIcons: Record<PlaceType, React.ReactNode> = {
  [PlaceType.STAY]: <Hotel className="w-5 h-5" strokeWidth={2} />,
  [PlaceType.ACTIVITY]: <Trees className="w-5 h-5" strokeWidth={2} />,
  [PlaceType.FOOD]: <UtensilsCrossed className="w-5 h-5" strokeWidth={2} />,
  [PlaceType.TRANSPORT]: <Car className="w-5 h-5" strokeWidth={2} />,
  [PlaceType.NOTE]: <FileText className="w-5 h-5" strokeWidth={2} />,
};

const PlaceTypeColors: Record<PlaceType, string> = {
  [PlaceType.STAY]: 'bg-[#160E53]/10 text-[#160E53]',
  [PlaceType.ACTIVITY]: 'bg-[#0b3d91]/10 text-[#0b3d91]',
  [PlaceType.FOOD]: 'bg-[#7a1b1b]/10 text-[#7a1b1b]',
  [PlaceType.TRANSPORT]: 'bg-[#3b2c6f]/10 text-[#3b2c6f]',
  [PlaceType.NOTE]: 'bg-[#7a5a00]/10 text-[#7a5a00]',
};

export default function JourneyReviewModal({
  isOpen,
  onClose,
  onConfirm,
  formData,
  journeyPlaces,
  days,
  getDateForDay,
  isSubmitting,
  isEditMode = false,
}: JourneyReviewModalProps) {
  if (!isOpen) return null;

  const getImageUrl = (photoKey: string) => {
    return photoKey.startsWith('http')
      ? photoKey
      : `https://viargos-sandbox.s3.us-east-2.amazonaws.com/${photoKey}`;
  };

  const isValidCoordinate = (lat?: number | null, lng?: number | null) => {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lng) &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  };

  const mapLocations = days.flatMap((day) =>
    (journeyPlaces[day] || [])
      .filter((place) => place.type !== PlaceType.NOTE)
      .filter((place) => isValidCoordinate(place.latitude, place.longitude))
      .map((place) => ({
        id: place.id,
        name: place.name,
        lat: place.latitude as number,
        lng: place.longitude as number,
        type: place.type.toLowerCase(),
        address: place.address || undefined,
        day,
      }))
  );

  const mapCenter = mapLocations.length
    ? { lat: mapLocations[0].lat, lng: mapLocations[0].lng }
    : { lat: 20.0, lng: 0.0 };

  // Calculate total places and photos
  const totalPlaces = days.reduce((sum, day) => sum + (journeyPlaces[day]?.length || 0), 0);
  const totalPhotos = days.reduce(
    (sum, day) => sum + (journeyPlaces[day]?.reduce((photoSum, place) => photoSum + (place.photos?.length || 0), 0) || 0),
    0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
          >
            {/* Header */}
            <div className="relative">
              {/* Cover Image */}
              {formData.coverImageUrl ? (
                <div className="relative h-48 bg-[#160E53] overflow-hidden">
                  <img
                    src={formData.coverImageUrl}
                    alt="Journey cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-[#160E53] to-[#0b0a2b]" />
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="absolute top-4 right-4 p-2 bg-white/95 hover:bg-white rounded-full shadow-lg transition-all disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-xs uppercase tracking-widest text-white/80 mb-2">Review Journey</p>
                <h2 className="text-3xl font-semibold mb-2 drop-shadow-sm">
                  {formData.title || 'Untitled Journey'}
                </h2>
                {formData.description && (
                  <p className="text-sm text-white/90 line-clamp-2">{formData.description}</p>
                )}
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              {/* Journey Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 text-center border border-slate-200 shadow-sm">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-[#160E53]" />
                  <p className="text-2xl font-semibold text-slate-900">{days.length}</p>
                  <p className="text-xs text-slate-500">Days</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-slate-200 shadow-sm">
                  <MapPin className="w-6 h-6 mx-auto mb-2 text-[#160E53]" />
                  <p className="text-2xl font-semibold text-slate-900">{totalPlaces}</p>
                  <p className="text-xs text-slate-500">Places</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-slate-200 shadow-sm">
                  <ImageIcon className="w-6 h-6 mx-auto mb-2 text-[#160E53]" />
                  <p className="text-2xl font-semibold text-slate-900">{totalPhotos}</p>
                  <p className="text-xs text-slate-500">Photos</p>
                </div>
              </div>

              {/* Map Preview */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-900">Journey Map Preview</p>
                </div>
                <div className="h-64">
                  {mapLocations.length > 0 ? (
                    <JourneyMap
                      locations={mapLocations}
                      center={mapCenter}
                      onLocationClick={() => {}}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-slate-500">
                      Add places with coordinates to see the map preview.
                    </div>
                  )}
                </div>
              </div>

              {/* Journey Days */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-900">Your Itinerary</h3>
                
                {days.map((day, dayIndex) => {
                  const dayPlaces = journeyPlaces[day] || [];
                  const nonNotePlaces = dayPlaces.filter(p => p.type !== PlaceType.NOTE);
                  const notePlace = dayPlaces.find(p => p.type === PlaceType.NOTE);

                  return (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: dayIndex * 0.1 }}
                      className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
                    >
                      {/* Day Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900">{day}</h4>
                          <p className="text-sm text-slate-500">{getDateForDay(day)}</p>
                        </div>
                        <div className="px-3 py-1 bg-[#160E53]/10 text-[#160E53] rounded-full text-xs font-semibold uppercase tracking-wide">
                          {nonNotePlaces.length} places
                        </div>
                      </div>

                      {/* Day Note */}
                      {notePlace && notePlace.description && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-amber-900">{notePlace.description}</p>
                          </div>
                        </div>
                      )}

                      {/* Places */}
                      {nonNotePlaces.length > 0 ? (
                        <div className="space-y-3">
                          {nonNotePlaces.map((place) => (
                            <div
                              key={place.id}
                              className="bg-white rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className={`p-2 rounded-lg ${PlaceTypeColors[place.type]}`}>
                                  {PlaceTypeIcons[place.type]}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h5 className="font-semibold text-slate-900 truncate">
                                      {place.name}
                                    </h5>
                                    {place.startTime && place.endTime && (
                                      <div className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        {place.startTime} - {place.endTime}
                                      </div>
                                    )}
                                  </div>

                                  {place.description && (
                                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                      {place.description}
                                    </p>
                                  )}

                                  {place.address && (
                                    <div className="flex items-start gap-1 text-xs text-slate-500 mb-2">
                                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-slate-400" />
                                      <span className="line-clamp-1">{place.address}</span>
                                    </div>
                                  )}

                                  {/* Photos */}
                                  {place.photos && place.photos.length > 0 && (
                                    <div className="flex gap-2 mt-2">
                                      {place.photos.slice(0, 3).map((photo, photoIndex) => (
                                        <div
                                          key={photoIndex}
                                          className="relative w-16 h-16 bg-slate-100 rounded-md overflow-hidden border border-slate-200"
                                        >
                                          <Image
                                            src={getImageUrl(photo)}
                                            alt={`Photo ${photoIndex + 1}`}
                                            fill
                                            className="object-cover"
                                            onError={(e) => {
                                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                                            }}
                                          />
                                        </div>
                                      ))}
                                      {place.photos.length > 3 && (
                                        <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center border border-slate-200">
                                          <span className="text-xs text-slate-600 font-medium">
                                            +{place.photos.length - 3}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <p className="text-sm">No places added for this day</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="border-t border-slate-200 p-6 bg-white">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">
                    {isEditMode ? 'Ready to save your changes?' : 'Ready to share your journey?'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isEditMode ? 'Your journey will be updated' : 'This will be visible to other travelers'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    {isEditMode ? 'Continue Editing' : 'Edit Journey'}
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#160E53] text-white font-medium rounded-lg hover:bg-[#002b9e] transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {isEditMode ? 'Updating...' : 'Posting...'}
                      </>
                    ) : (
                      isEditMode ? 'Update Journey' : 'Post Journey'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
