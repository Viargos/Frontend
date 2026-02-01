'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { JourneyMap } from '@/components/maps';
import { serviceFactory } from '@/lib/services/service-factory';
import { useAuthStore } from '@/store/auth.store';
import { Journey } from '@/types/journey.types';
import { format } from 'date-fns';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { extractJourneyLocations, calculateLocationsCenter } from '@/utils/journey-locations.utils';
import { Hotel, Trees, UtensilsCrossed, Car, FileText, ArrowLeft } from 'lucide-react';
import { ImageViewerModal } from '@/components/ui';
import { JourneyPosts } from '@/components/journey';
import { AlertCircleIcon, MapPinIcon, ImageIcon } from '@/components/icons';

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
  const router = useRouter();
  const journeyId = params.id as string;

  const [journey, setJourney] = useState<Journey | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const { location: currentLocation } = useCurrentLocation();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const { user: currentUser } = useAuthStore();
  console.log(selectedLocation);

  // Check if the current user is the owner of this journey
  const isOwner = currentUser?.id === journey?.user?.id;

  // Helper function to get image URL from S3 key
  const getImageUrl = (photoKey: string): string => {
    if (photoKey.startsWith('http')) {
      return photoKey;
    }
    return `https://viargos-sandbox.s3.us-east-2.amazonaws.com/${photoKey}`;
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
        console.log('Journey data received:', fetchedJourney);
        if (fetchedJourney?.days) {
          const imageSummary = fetchedJourney.days.flatMap((day: any) =>
            (day.places || []).map((place: any) => ({
              id: place.id,
              name: place.name,
              photos: place.photos,
              images: (place as any).images,
            }))
          );
          console.log('Journey images (legacy photos/images):', imageSummary);

          const mediaSummary = fetchedJourney.days.flatMap((day: any) =>
            (day.places || []).map((place: any) => ({
              id: place.id,
              name: place.name,
              mediaCount: Array.isArray(place.media) ? place.media.length : 0,
              media: place.media,
            }))
          );
          console.log(
            '[JOURNEY_FETCH] Journey place media summary:',
            mediaSummary
          );
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
                (m.type === 'IMAGE' || m.type === 'image')
            )
            .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
            .map((m: any) => m.url)
        : [];

      const combinedPhotos = (
        legacyPhotos.length > 0 ? legacyPhotos : mediaImages
      ) as string[];

      if (!combinedPhotos.length) {
        console.log(
          '[JOURNEY_MEDIA_MISSING] No photos/media for place on journey detail page',
          {
            placeId: place.id,
            placeName: place.name,
          }
        );
      } else {
        console.log(
          '[JOURNEY_MEDIA_RESOLVED] Photos for place on journey detail page',
          {
            placeId: place.id,
            placeName: place.name,
            photoCount: combinedPhotos.length,
          }
        );
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
    return journeyLocations.map(loc => {
      // Find the original place to get media data
      let photos: string[] = [];
      if (journey.days) {
        for (const day of journey.days) {
          const place = day.places?.find(p => p.id === loc.placeId);
          if (place && place.media) {
            photos = place.media
              .filter(m => m.type === 'image')
              .map(m => m.url.startsWith('http') 
                ? m.url 
                : `https://viargos-sandbox.s3.us-east-2.amazonaws.com/${m.url}`
              );
            break;
          }
        }
      }

      return {
        id: loc.id,
        name: loc.name,
        lat: loc.lat,
        lng: loc.lng,
        type: loc.type,
        address: loc.address,
        day: loc.day,
        startTime: loc.startTime,
        endTime: loc.endTime,
        photos: photos.length > 0 ? photos : undefined,
      };
    });
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
              <AlertCircleIcon className="w-8 h-8 mx-auto" />
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

  // Helper to convert S3 key to full URL
  const getCoverImageUrl = (coverImage: string | null | undefined): string => {
    if (!coverImage) {
      return '/london.png';
    }
    if (coverImage.startsWith('http')) {
      return coverImage;
    }
    return `https://viargos-sandbox.s3.us-east-2.amazonaws.com/${coverImage}`;
  };

  // Always derive the actual cover image src we render, so logging and UI stay in sync
  const coverImageSrc = getCoverImageUrl(journey?.coverImage);
  
  // Debug logging
  console.log('[JOURNEY_DETAIL] Cover image debug:', {
    rawCoverImage: journey?.coverImage,
    convertedUrl: coverImageSrc,
  });

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
            console.log('Cover image loaded successfully:', coverImageSrc);
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

        {/* Title and Description Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8" style={{ zIndex: 3 }}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            {journey.title}
          </h1>
          {journey.description && (
            <p className="text-sm sm:text-base md:text-lg text-white/90 line-clamp-2 drop-shadow-md max-w-3xl">
              {journey.description}
            </p>
          )}
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-2 left-2 sm:top-4 sm:left-4 transition-all duration-200 bg-white/20 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-white/30 flex items-center gap-1 sm:gap-2"
          style={{ zIndex: 4 }}
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Journey Details Card */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
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
              <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide">
                {journey.days.map(day => (
                  <button
                    key={day.id}
                    onClick={() => setActiveDay(day.dayNumber)}
                    className={`px-4 py-2 rounded-full font-medium transition-all text-sm whitespace-nowrap flex-shrink-0 ${
                      activeDay === day.dayNumber
                        ? 'bg-[#160E53] text-white shadow-md scale-105'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-[#160E53] hover:text-[#160E53] shadow-sm'
                    }`}
                  >
                    Day {day.dayNumber + 1}
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-[#160E53] text-sm sm:text-base">
                  This journey doesn&apos;t have any days planned yet.
                </p>
              </div>
            )}

            {/* Day Content */}
            {currentDay && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-4">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                    Day {currentDay.dayNumber + 1}
                  </h2>
                  <span className="hidden sm:inline text-gray-400">-</span>
                  <p className="text-sm sm:text-base text-gray-600 sm:text-gray-900 sm:font-semibold">
                    {formatDayDate(currentDay.date)}
                  </p>
                </div>

                {/* Timeline Display */}
                {currentDay &&
                currentDay.places &&
                currentDay.places.length > 0 ? (
                  <div className="relative">
                    {/* Timeline Line - Hidden on mobile */}
                    <div className="hidden sm:block absolute left-5 md:left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  <div className="space-y-4 sm:space-y-6">
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
                        {/* Timeline Dot - Hidden on mobile for cleaner look */}
                        <div 
                          className={`hidden sm:flex relative z-10 w-10 h-10 md:w-12 md:h-12 bg-white border-2 rounded-full flex-shrink-0 items-center justify-center p-0 m-0 transition-transform duration-300 hover:scale-110 border-[#160E53]`}
                        >
                          <div className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-full flex items-center justify-center p-0 m-0">
                            {place.type === 'stay' && (
                              <Hotel className="w-3 h-3 md:w-4 md:h-4 text-[#160E53]" strokeWidth={2} />
                            )}
                            {place.type === 'activity' && (
                              <Trees className="w-3 h-3 md:w-4 md:h-4 text-[#160E53]" strokeWidth={2} />
                            )}
                            {place.type === 'food' && (
                              <UtensilsCrossed className="w-3 h-3 md:w-4 md:h-4 text-[#160E53]" strokeWidth={2} />
                            )}
                            {place.type === 'transport' && (
                              <Car className="w-3 h-3 md:w-4 md:h-4 text-[#160E53]" strokeWidth={2} />
                            )}
                            {place.type === 'note' && (
                              <FileText className="w-3 h-3 md:w-4 md:h-4 text-[#160E53]" strokeWidth={2} />
                            )}
                          </div>
                        </div>

                        {/* Timeline Content */}
                        <div className="sm:ml-4 md:ml-6 flex-1 min-w-0 w-full">
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Mobile Layout: Stack vertically */}
                            <div className="flex flex-col sm:flex-row">
                              {/* Activity Image */}
                              <div className="relative w-full sm:w-28 md:w-32 lg:w-36 h-32 sm:h-28 md:h-32 lg:h-36 bg-gray-100 flex-shrink-0">
                                {place.photos && place.photos.length > 0 && !failedImages.has(place.id) ? (
                                  <Image
                                    src={getImageUrl(place.photos[0])}
                                    alt={place.name}
                                    className="w-full h-full object-cover"
                                    onError={() => handleImageError(place.id)}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                    <div className="w-12 h-12 sm:w-10 sm:h-10 bg-[#160E53] rounded-full flex items-center justify-center">
                                      {place.type === 'stay' && (
                                        <Hotel className="w-6 h-6 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
                                      )}
                                      {place.type === 'activity' && (
                                        <Trees className="w-6 h-6 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
                                      )}
                                      {place.type === 'food' && (
                                        <UtensilsCrossed className="w-6 h-6 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
                                      )}
                                      {place.type === 'transport' && (
                                        <Car className="w-6 h-6 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
                                      )}
                                    </div>
                                  </div>
                                )}
                                {/* Type badge on mobile */}
                                <div className="absolute top-2 left-2 sm:hidden">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#160E53] text-white`}>
                                    {place.type === 'stay' && 'Stay'}
                                    {place.type === 'activity' && 'Activity'}
                                    {place.type === 'food' && 'Food'}
                                    {place.type === 'transport' && 'Transport'}
                                  </span>
                                </div>
                                {/* Photo count badge */}
                                {place.photos && place.photos.length > 1 && (
                                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3" />
                                    {place.photos.length}
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 p-3 sm:p-4 min-w-0">
                                <div className="flex flex-col h-full">
                                  {/* Header with title and view button */}
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2">
                                      {place.name}
                                    </h3>
                                    {/* View Images button - Desktop */}
                                    <button
                                      onClick={() => handleLocationClick(place)}
                                      className="hidden sm:flex items-center text-xs sm:text-sm text-[#160E53] hover:text-[#241A7A] transition-colors flex-shrink-0 font-medium"
                                    >
                                      <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                                      <span className="hidden md:inline">View Images</span>
                                      <span className="md:hidden">View</span>
                                    </button>
                                  </div>
                                  
                                  {/* Category tag - Desktop */}
                                  <div className="hidden sm:flex items-center text-xs text-gray-500 mb-2">
                                    <MapPinIcon className="w-3.5 h-3.5 mr-1 text-gray-400 flex-shrink-0" />
                                    <span>
                                      {place.type === 'stay' && 'Accommodation'}
                                      {place.type === 'activity' && 'Activity'}
                                      {place.type === 'food' && 'Restaurant'}
                                      {place.type === 'transport' && 'Transport'}
                                    </span>
                                  </div>
                                  
                                  {/* Address */}
                                  {place.address && (
                                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 sm:line-clamp-3 flex-1">
                                      {place.address}
                                    </p>
                                  )}
                                  
                                  {/* Mobile View Images button */}
                                  <button
                                    onClick={() => handleLocationClick(place)}
                                    className="sm:hidden mt-3 w-full flex items-center justify-center gap-1.5 text-sm text-white bg-[#160E53] hover:bg-[#241A7A] transition-colors font-medium py-2 px-3 rounded-lg"
                                  >
                                    <ImageIcon className="w-4 h-4" />
                                    View All Images
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
                        {/* Timeline Dot for Notes - Hidden on mobile */}
                        <div className="hidden sm:flex relative z-10 w-10 h-10 md:w-12 md:h-12 bg-white border-2 border-[#160E53] rounded-full flex-shrink-0 items-center justify-center p-0 m-0">
                          <div className="w-5 h-5 md:w-6 md:h-6 bg-[#160E53] rounded-full flex items-center justify-center p-0 m-0">
                            <FileText className="w-3 h-3 md:w-4 md:h-4 text-white" strokeWidth={2} />
                          </div>
                        </div>

                        {/* Notes Content */}
                        <div className="sm:ml-4 md:ml-6 flex-1 w-full">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-blue-200">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="text-[#160E53] flex-shrink-0">
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-[#160E53] mb-1 text-sm sm:text-base">
                                  Notes
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-700 break-words">
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
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-gray-200 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#160E53]/10 rounded-full flex items-center justify-center mx-auto mb-3 p-0 m-0">
                    <MapPinIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#160E53]" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                    No places added yet
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm mb-4 max-w-xs mx-auto">
                    {isOwner 
                      ? 'Start planning your day by adding places to visit, restaurants, or accommodations.'
                      : 'This day has no places added yet.'}
                  </p>
                  {isOwner && (
                    <button className="bg-[#160E53] text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-[#241A7A] transition-colors">
                      Add Your First Place
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          </div>

          {/* Journey Posts Section */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <JourneyPosts
              journeyId={journeyId}
              journeyTitle={journey?.title || 'this journey'}
              isOwner={isOwner}
            />
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="lg:col-span-1 rounded-xl overflow-hidden shadow-sm lg:sticky lg:top-6 lg:self-start order-first lg:order-last mb-4 lg:mb-0">
          <div className="h-[280px] sm:h-[320px] md:h-[380px] lg:h-[calc(100vh-8rem)] lg:min-h-[460px]">
            <JourneyMap
              locations={getAllJourneyLocations()}
              center={getJourneyCenter()}
              onLocationClick={handleLocationClick}
            />
          </div>
        </div>
      </div>

      {/* View Images Modal - Compact Slideshow */}
      {selectedLocation && (
        <ImageViewerModal
          isOpen={!!selectedLocation}
          onClose={() => setSelectedLocation(null)}
          images={selectedLocation?.photos?.filter(p => !!p).map(p => getImageUrl(p)) || []}
          title={selectedLocation?.name || 'Location images'}
        />
      )}
    </div>
  );
}
