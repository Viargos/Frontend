'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { JourneyMapWebGL } from '@/components/maps';
import { serviceFactory } from '@/lib/services/service-factory';
import { Journey } from '@/types/journey.types';
import { format } from 'date-fns';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { generateJourneyTitle, generateJourneySubtitle } from '@/utils/journey.utils';
import { extractJourneyLocations, calculateLocationsCenter } from '@/utils/journey-locations.utils';
import PlaceToStayIcon from '@/components/icons/PlaceToStayIcon';
import { TreesIcon } from '@/components/icons/TreesIcon';
import { FoodIcon } from '@/components/icons/FoodIcon';
import { TransportIcon } from '@/components/icons/TransportIcon';
import { NotesIcon } from '@/components/icons/NotesIcon';
import PhotoGallery from '@/components/media/PhotoGallery';
import Modal from '@/components/ui/Modal';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  address?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  photos?: string[];
}

export default function JourneyDetailsPage() {
  const params = useParams();
  const journeyId = params.id as string;

  const [journey, setJourney] = useState<Journey | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const { location: currentLocation } = useCurrentLocation();
  const [isBannerEditModalOpen, setIsBannerEditModalOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  console.log(isBannerEditModalOpen, selectedLocation);

  // Helper function to get image URL from S3 key
  const getImageUrl = (photoKey: string): string => {
    if (photoKey.startsWith("http")) {
      return photoKey;
    }
    return `https://viargos.s3.us-east-2.amazonaws.com/${photoKey}`;
  };

  // Helper function to handle image load error
  const handleImageError = (placeId: string) => {
    setFailedImages(prev => new Set(prev).add(placeId));
  };

  useEffect(() => {
    const fetchJourney = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (!journeyId) {
          throw new Error('No journey ID provided');
        }
        const journeyService = serviceFactory.journeyService;
        const fetchedJourney = await journeyService.getJourneyById(journeyId);
        console.log("Journey data received:", fetchedJourney);
        if (fetchedJourney?.days) {
          const imageSummary = fetchedJourney.days.flatMap((day: any) =>
            (day.places || []).map((place: any) => ({
              id: place.id,
              name: place.name,
              photos: place.photos,
              images: (place as any).images,
            }))
          );
          console.log("Journey images (legacy photos/images):", imageSummary);

          const mediaSummary = fetchedJourney.days.flatMap((day: any) =>
            (day.places || []).map((place: any) => ({
              id: place.id,
              name: place.name,
              mediaCount: Array.isArray(place.media) ? place.media.length : 0,
              media: place.media,
            }))
          );
          console.log("[JOURNEY_FETCH] Journey place media summary:", mediaSummary);
        }
        setJourney(fetchedJourney);

        // Set active day to 1 if there are days, or the first available day
        if (fetchedJourney.days && fetchedJourney.days.length > 0) {
          setActiveDay(fetchedJourney.days[0].dayNumber);
        }
      } catch (error) {
        console.error('Error fetching journey:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace',
          errorType: typeof error,
          errorObject: error,
        });
        setError(
          error instanceof Error ? error.message : 'Failed to load journey'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (journeyId) {
      fetchJourney();
    } else {
      console.error('No journey ID found in URL params');
      setError('Invalid journey URL - no ID provided');
      setIsLoading(false);
    }
  }, [journeyId]);

  const handleLocationClick = (location: Location) => {
    // Log for debugging to validate photos payload
    console.log('Selected location for images:', {
      id: location.id,
      name: location.name,
      photos: location.photos,
    });
    setSelectedLocation(location);
  };

  // Helper function to format date properly
  const formatDayDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE, MMMM d, yyyy'); // e.g., "Saturday, October 2, 2025"
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // fallback to original string if formatting fails
    }
  };

  // Helper function to organize places by type
  const getPlacesByType = (day: any) => {
    const places = day?.places || [];
    const organized = {
      placeToStay: [] as Location[],
      placesToGo: [] as Location[],
      food: [] as Location[],
      transport: [] as Location[],
      notes: [] as Location[],
    };

    places.forEach((place: any) => {
      // Derive photos from legacy fields OR from media (IMAGE type)
      const legacyPhotos: string[] =
        (place.photos as string[] | undefined) ||
        ((place as any).images as string[] | undefined) ||
        [];

      const mediaImages: string[] = Array.isArray(place.media)
        ? place.media
            .filter(
              (m: any) =>
                m &&
                typeof m.url === 'string' &&
                m.url.length > 0 &&
                (m.type === 'IMAGE' || m.type === 'image'),
            )
            .sort(
              (a: any, b: any) =>
                (a.order ?? 0) - (b.order ?? 0),
            )
            .map((m: any) => m.url)
        : [];

      const combinedPhotos = (legacyPhotos.length > 0 ? legacyPhotos : mediaImages) as string[];

      if (!combinedPhotos.length) {
        console.log('[JOURNEY_MEDIA_MISSING] No photos/media for place on journey detail page', {
          placeId: place.id,
          placeName: place.name,
        });
      } else {
        console.log('[JOURNEY_MEDIA_RESOLVED] Photos for place on journey detail page', {
          placeId: place.id,
          placeName: place.name,
          photoCount: combinedPhotos.length,
        });
      }

      const location: Location = {
        id: place.id,
        name: place.name,
        lat: place.latitude ? parseFloat(place.latitude) : 0,
        lng: place.longitude ? parseFloat(place.longitude) : 0,
        type: place.type,
        address: place.address || place.description,
        // ✅ Use 1-based day label for consistency with tabs and map utilities
        day: `Day ${day.dayNumber + 1}`,
        // Support both legacy photos/images and new media-based images
        photos: combinedPhotos,
      };

      // Map to 3D map compatible types
      const mappedType =
        place.type === 'STAY'
          ? 'stay'
          : place.type === 'ACTIVITY'
          ? 'activity'
          : place.type === 'FOOD'
          ? 'food'
          : place.type === 'TRANSPORT'
          ? 'transport'
          : place.type === 'NOTE'
          ? 'note'
          : 'note';

      location.type = mappedType;

      switch (place.type) {
        case 'STAY':
          organized.placeToStay.push(location);
          break;
        case 'ACTIVITY':
          organized.placesToGo.push(location);
          break;
        case 'FOOD':
          organized.food.push(location);
          break;
        case 'TRANSPORT':
          organized.transport.push(location);
          break;
        case 'NOTE':
          organized.notes.push(location);
          break;
        default:
          organized.placesToGo.push(location);
      }
    });

    return organized;
  };

  // const handleBannerSave = (bannerData: BannerData) => {
  //   if (journey) {
  //     setJourney({
  //       ...journey,
  //       banner: bannerData,
  //     });
  //   }
  // };

  // Get all locations from all days of the journey
  const getAllJourneyLocations = (): Location[] => {
    if (!journey) {
      return [];
    }
    
    // Use utility to extract all locations (already sorted by day and time)
    const journeyLocations = extractJourneyLocations(journey);
    
    // Convert to Location format expected by map
    return journeyLocations.map(loc => ({
      id: loc.id,
      name: loc.name,
      lat: loc.lat,
      lng: loc.lng,
      type: loc.type,
      address: loc.address,
      day: loc.day,
      startTime: loc.startTime,
      endTime: loc.endTime,
    }));
  };

  // Get journey center location for map
  const getJourneyCenter = () => {
    const allLocations = getAllJourneyLocations();
    
    if (allLocations.length > 0) {
      return calculateLocationsCenter(allLocations);
    }

    // Use current location if available
    if (currentLocation) {
      return {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
      };
    }

    // Fallback to world center if no location available
    return { lat: 20.0, lng: 0.0 };
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-gray-50 p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading journey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-50 p-4 sm:p-6">
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 mb-2">
              <svg
                className="w-8 h-8 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Failed to load journey
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="flex-1 bg-gray-50 p-4 sm:p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Journey not found</p>
        </div>
      </div>
    );
  }

  const currentDay = journey.days?.find(day => day.dayNumber === activeDay);

  // Always derive the actual cover image src we render, so logging and UI stay in sync
  const coverImageSrc = journey?.coverImage || '/london.png';

  return (
    <div className="flex-1 bg-gray-50 p-4 sm:p-6 max-w-none">
      {/* Banner Section */}
      <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 w-full mb-4 sm:mb-6 overflow-hidden rounded-lg group">
        {/* Background Image */}
        <Image
          src={coverImageSrc}
          alt="Journey cover"
          fill
          className="object-cover"
          style={{ zIndex: 1 }}
          priority={true}
          onLoad={() => {
            console.log(
              'Cover image loaded successfully:',
              coverImageSrc
            );
          }}
          onError={() => {
            console.error('Cover image failed to load:', coverImageSrc);
          }}
        />

        {/* Black Overlay */}
        <div
          className="absolute inset-0 bg-black/40"
          style={{ zIndex: 2 }}
        ></div>

        {/* Edit Button */}
        <button
          onClick={() => setIsBannerEditModalOpen(true)}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/20 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-white/30 flex items-center gap-1 sm:gap-2"
        >
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <span className="hidden sm:inline">Edit</span>
        </button>

        {/* Journey Name and Subtitle Overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
          style={{ zIndex: 3 }}
        >
          {/* Journey Name */}
          <div className="w-full max-w-4xl mb-2">
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white"
              style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
              }}
            >
              {generateJourneyTitle(journey)}
            </h1>
          </div>

          {/* Subtitle/Description */}
          <div className="w-full max-w-xl">
            <p
              className="text-sm sm:text-base lg:text-lg text-white/90"
              style={{
                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
              }}
            >
              {generateJourneySubtitle(journey)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-h-[calc(100vh-16rem)]">
        {/* Left Content */}
        <div className="lg:col-span-2 bg-white rounded-lg p-4 sm:p-6 overflow-y-auto shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Journey Details
              </h2>
            </div>
          </div>

          {/* Day Tabs */}
          {journey.days && journey.days.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              {journey.days.map(day => (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(day.dayNumber)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    activeDay === day.dayNumber
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  Day {day.dayNumber + 1}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 sm:mb-6">
              <p className="text-yellow-800">
                This journey doesn&apos;t have any days planned yet.
              </p>
            </div>
          )}

          {/* Day Content */}
          {currentDay && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">
                Day {currentDay.dayNumber + 1} -{' '}
                {formatDayDate(currentDay.date)}
              </h2>

              {/* Timeline Display */}
              {currentDay &&
              currentDay.places &&
              currentDay.places.length > 0 ? (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  <div className="space-y-6">
                    {/* All places combined in timeline format */}
                    {[
                      ...getPlacesByType(currentDay).placeToStay,
                      ...getPlacesByType(currentDay).placesToGo,
                      ...getPlacesByType(currentDay).food,
                      ...getPlacesByType(currentDay).transport,
                    ].map((place, index) => (
                      <div
                        key={`${place.id}-${index}`}
                        className="relative flex items-start"
                      >
                        {/* Timeline Dot */}
                        <div 
                          className={`relative z-10 w-12 h-12 bg-white border-2 rounded-full flex-shrink-0 flex items-center justify-center p-0 m-0 transition-transform duration-300 hover:scale-110 ${
                            place.type === 'stay' ? 'border-[#2563eb]' :
                            place.type === 'activity' ? 'border-[#16a34a]' :
                            place.type === 'food' ? 'border-[#dc2626]' :
                            place.type === 'transport' ? 'border-[#7c3aed]' :
                            place.type === 'note' ? 'border-[#eab308]' :
                            'border-blue-600'
                          }`}
                        >
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center p-0 m-0">
                            {place.type === 'stay' && (
                              <PlaceToStayIcon className="w-6 h-6" />
                            )}
                            {place.type === 'activity' && (
                              <TreesIcon className="w-6 h-6" />
                            )}
                            {place.type === 'food' && (
                              <FoodIcon className="w-6 h-6" />
                            )}
                            {place.type === 'transport' && (
                              <TransportIcon className="w-6 h-6" />
                            )}
                            {place.type === 'note' && (
                              <NotesIcon className="w-6 h-6" />
                            )}
                          </div>
                        </div>

                        {/* Timeline Content */}
                        <div className="ml-6 flex-1 min-w-0">
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex overflow-hidden">
                              {/* Activity Image Square/Circle */}
                              <div className="w-24 h-20 sm:w-32 sm:h-32 bg-gray-100 flex items-center justify-center flex-shrink-0">
                                {place.photos && place.photos.length > 0 && !failedImages.has(place.id) ? (
                                  <div className="w-full h-full overflow-hidden rounded-lg">
                                    <img
                                      src={getImageUrl(place.photos[0])}
                                      alt={place.name}
                                      className="w-full h-full object-cover"
                                      onError={() => handleImageError(place.id)}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center p-0 m-0">
                                    {place.type === 'stay' && (
                                      <PlaceToStayIcon className="w-6 h-6 text-white" />
                                    )}
                                    {place.type === 'activity' && (
                                      <TreesIcon className="w-6 h-6 text-white" />
                                    )}
                                    {place.type === 'food' && (
                                      <FoodIcon className="w-6 h-6 text-white" />
                                    )}
                                    {place.type === 'transport' && (
                                      <TransportIcon className="w-6 h-6 text-white" />
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 p-4 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
                                      {place.name}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                      <svg
                                        className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                      </svg>
                                      <span className="truncate">
                                        {place.type === 'stay' &&
                                          'Accommodation & Theme Parks'}
                                        {place.type === 'activity' &&
                                          'Attractions & Activities'}
                                        {place.type === 'food' &&
                                          'Restaurants & Dining'}
                                        {place.type === 'transport' &&
                                          'Transportation'}
                                      </span>
                                    </div>
                                    {place.address && (
                                      <p className="text-sm text-gray-500 break-words whitespace-normal">
                                        {place.address}
                                      </p>
                                    )}
                                  </div>

                                  {/* View Images button */}
                                  <button
                                    onClick={() => handleLocationClick(place)}
                                    className="ml-4 flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors flex-shrink-0"
                                  >
                                    <svg
                                      className="w-4 h-4 mr-1"
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
                                    View Images
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Notes in timeline */}
                    {currentDay.notes && (
                      <div className="relative flex items-start">
                        {/* Timeline Dot for Notes */}
                        <div className="relative z-10 w-12 h-12 bg-white border-2 border-yellow-500 rounded-full flex-shrink-0 flex items-center justify-center p-0 m-0">
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center p-0 m-0">
                            <NotesIcon className="w-6 h-6" />
                          </div>
                        </div>

                        {/* Notes Content */}
                        <div className="ml-6 flex-1">
                          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                            <div className="flex items-start">
                              <div className="text-yellow-600 mr-2">
                                <NotesIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-medium text-yellow-800 mb-1">
                                  Notes
                                </h4>
                                <p className="text-sm text-yellow-700">
                                  {currentDay.notes}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 p-0 m-0">
                    <span className="text-blue-600 text-xl leading-none flex items-center justify-center w-full h-full">📍</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    No places added yet
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Start planning your day by adding places to visit,
                    restaurants, or accommodations.
                  </p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                    Add Your First Place
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side - 3D WebGL Map */}
        <div className="lg:col-span-1 rounded-lg overflow-hidden shadow-sm lg:sticky lg:top-0 lg:self-start">
          <div className="h-[460px] sticky">
            <JourneyMapWebGL
              locations={getAllJourneyLocations()}
              center={getJourneyCenter()}
              onLocationClick={handleLocationClick}
              enableAnimation={true}
            />
          </div>
        </div>
      </div>

      {/* View Images Modal */}
      <Modal
        isOpen={!!selectedLocation}
        onClose={() => setSelectedLocation(null)}
        className="max-w-3xl"
      >
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedLocation?.name || 'Location images'}
            </h3>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {selectedLocation?.photos && selectedLocation.photos.length > 0 ? (
            <PhotoGallery
              // Use final public file URLs; if backend stored keys, convert via getImageUrl
              photos={selectedLocation.photos
                .filter((p) => !!p)
                .map((p) => getImageUrl(p))}
              showRemoveButton={false}
            />
          ) : (
            <p className="text-sm text-gray-500">No images available</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
