'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DayFilter, PlanningCategory, CoverImage, PlaceCard, JourneyReviewModal } from '@/components/journey';
import { Hotel, Trees, UtensilsCrossed, Car, FileText, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { PlaceType, CreateJourneyPlace } from '@/types/journey.types';
import { useEditJourneyForm } from '@/hooks/useEditJourneyForm';
import { ErrorAlert } from '@/components/ui';
import PhotoGallery from '@/components/media/PhotoGallery';
import JourneyMap from '@/components/maps/JourneyMap';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';

export default function EditJourneyPage() {
  const router = useRouter();
  const params = useParams();
  const journeyId = params.id as string;

  const [activePlaceType] = useState<PlaceType | null>(null);
  const [journeyName, setJourneyName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [nameInitialized, setNameInitialized] = useState(false);
  const { location: currentLocation } = useCurrentLocation();

  const {
    isLoadingJourney,
    loadError,
    journeyLoaded,
    formData,
    updateFormData,
    days,
    activeDay,
    setActiveDay,
    addDay,
    deleteDay,
    getDateForDay,
    journeyPlaces,
    getActiveDayPlaces,
    addPlaceToActiveDay,
    removePlaceFromActiveDay,
    updatePlaceField,
    addPhotoToPlace,
    removePhotoFromPlace,
    togglePlaceExpansion,
    isPlaceExpanded,
    isSubmitting,
    errorMessage,
    setErrorMessage,
    submitUpdateWithData,
  } = useEditJourneyForm(journeyId);

  // Initialize journey name and subtitle from loaded data
  if (journeyLoaded && !nameInitialized && formData.title) {
    setJourneyName(formData.title);
    setSubtitle(formData.description);
    setNameInitialized(true);
  }

  // Handle opening review modal
  const handleOpenReview = useCallback(() => {
    const updatedFormData = {
      title: journeyName || formData.title,
      description: subtitle || formData.description,
    };
    updateFormData(updatedFormData);
    setShowReviewModal(true);
  }, [journeyName, subtitle, formData.title, formData.description, updateFormData]);

  // Handle actual form submission (called from modal)
  const handleSubmit = async () => {
    const updatedFormData = {
      title: journeyName || formData.title,
      description: subtitle || formData.description,
    };

    const success = await submitUpdateWithData(updatedFormData);

    if (success) {
      setShowReviewModal(false);
      router.push(`/journey/${journeyId}`);
    }
  };

  // Handle direct save without review
  const handleDirectSave = async () => {
    const updatedFormData = {
      title: journeyName || formData.title,
      description: subtitle || formData.description,
    };

    const success = await submitUpdateWithData(updatedFormData);

    if (success) {
      router.push(`/journey/${journeyId}`);
    }
  };

  // Transform journey places to map locations
  const mapLocations = useMemo(() => {
    const locations: Array<{
      id: string;
      name: string;
      lat: number;
      lng: number;
      type: string;
      address?: string;
      day?: string;
    }> = [];

    const activeDayPlaces = getActiveDayPlaces();
    
    activeDayPlaces.forEach((place, index) => {
      const hasValidCoordinates =
        place.latitude &&
        place.longitude &&
        place.latitude !== 0 &&
        place.longitude !== 0;

      if (hasValidCoordinates && place.latitude !== undefined && place.longitude !== undefined) {
        const location = {
          id: `${activeDay}-${index}`,
          name: place.name,
          lat: place.latitude,
          lng: place.longitude,
          type: place.type.toLowerCase(),
          address: place.address || undefined,
          day: activeDay,
        };
        locations.push(location);
      }
    });

    return locations;
  }, [getActiveDayPlaces, activeDay]);

  // Get map center
  const getMapCenter = useCallback(() => {
    const activePlaces = getActiveDayPlaces();

    const placeWithCoords = activePlaces.find(
      place =>
        place.latitude &&
        place.longitude &&
        place.latitude !== 0 &&
        place.longitude !== 0
    );

    if (placeWithCoords) {
      return {
        lat: placeWithCoords.latitude!,
        lng: placeWithCoords.longitude!,
      };
    }

    if (currentLocation) {
      return {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
      };
    }

    return { lat: 20.0, lng: 0.0 };
  }, [getActiveDayPlaces, currentLocation]);

  // Handle map click to add new place
  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        const newPlace: CreateJourneyPlace = {
          name: 'New Place',
          description: '',
          type: activePlaceType || PlaceType.ACTIVITY,
          startTime: '09:00',
          endTime: '10:00',
          latitude: lat,
          longitude: lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        };

        addPlaceToActiveDay(newPlace.type);

        const newIndex = getActiveDayPlaces().length;
        togglePlaceExpansion(activeDay, newIndex);
      }
    },
    [
      activePlaceType,
      activeDay,
      addPlaceToActiveDay,
      getActiveDayPlaces,
      togglePlaceExpansion,
    ]
  );

  // Handle cover image upload
  const handleCoverImageUpload = useCallback(
    (url: string, key?: string) => {
      updateFormData({
        coverImageUrl: url,
        coverImageKey: key || null,
      });
    },
    [updateFormData]
  );

  // Handle photo removal
  const handleRemovePhoto = useCallback(
    (index: number) => {
      const updatedPhotos = formData.photos.filter((_, i) => i !== index);
      updateFormData({ photos: updatedPhotos });
    },
    [formData.photos, updateFormData]
  );

  // Loading state
  if (isLoadingJourney) {
    return (
      <div className="flex-1 bg-gray-50 p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#160E53] mx-auto mb-4" />
            <p className="text-gray-600">Loading journey...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="flex-1 bg-gray-50 p-4 sm:p-6">
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Failed to load journey
            </h3>
            <p className="text-red-600 mb-4">{loadError}</p>
            <button
              onClick={() => router.back()}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-none">
      <div className="flex flex-col gap-6 w-full">
        {/* Header with Back and Save buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleDirectSave}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Save</span>
            </button>
            
            <button
              onClick={handleOpenReview}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-[#160E53] text-white rounded-lg hover:bg-[#160E53]/90 transition-colors disabled:opacity-50"
            >
              <span className="text-sm font-medium">Review & Update</span>
            </button>
          </div>
        </div>

        {/* Hero Cover Image */}
        <CoverImage
          imageUrl={formData.coverImageUrl}
          onImageUpload={handleCoverImageUpload}
          journeyName={journeyName}
          subtitle={subtitle}
          onJourneyNameChange={setJourneyName}
          onSubtitleChange={setSubtitle}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 w-full">
          {/* Left Content */}
          <div className="flex flex-col items-start gap-8 w-full lg:col-span-2">
            {/* Error Alert */}
            {errorMessage && (
              <ErrorAlert
                message={errorMessage}
                onDismiss={() => setErrorMessage(null)}
                title="Unable to update journey"
              />
            )}

            {/* Day Filter */}
            <DayFilter
              days={days}
              activeDay={activeDay}
              onDayChange={setActiveDay}
              onAddDay={addDay}
              onDeleteDay={deleteDay}
            />

            {/* Day Content */}
            <div className="flex flex-col items-start gap-6 w-full">
              {/* Active Day */}
              {activeDay && (
                <div className="flex p-4 sm:p-6 flex-col justify-center items-start gap-4 sm:gap-6 w-full rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="flex flex-col justify-center items-start gap-6 sm:gap-8 w-full">
                    {/* Day Header */}
                    <div className="flex flex-col items-start gap-2 w-full">
                      <div className="text-gray-600 font-manrope text-sm font-normal leading-5 w-full">
                        {activeDay}
                      </div>
                      <div className="text-gray-900 font-manrope text-base sm:text-lg font-semibold leading-6 w-full">
                        {getDateForDay(activeDay)}
                      </div>
                    </div>

                    {/* Planning Categories */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
                      <PlanningCategory
                        icon={<Hotel className="w-8 h-8" strokeWidth={2} color="#160E53" />}
                        label="Hotel / Stay"
                        isActive={activePlaceType === PlaceType.STAY}
                        onClick={() => addPlaceToActiveDay(PlaceType.STAY)}
                        bgColor="#ffffff"
                      />
                      <PlanningCategory
                        icon={<Trees className="w-8 h-8" strokeWidth={2} color="#160E53" />}
                        label="Places to go"
                        isActive={activePlaceType === PlaceType.ACTIVITY}
                        onClick={() => addPlaceToActiveDay(PlaceType.ACTIVITY)}
                        bgColor="#ffffff"
                      />
                      <PlanningCategory
                        icon={<UtensilsCrossed className="w-8 h-8" strokeWidth={2} color="#160E53" />}
                        label="Food"
                        isActive={activePlaceType === PlaceType.FOOD}
                        onClick={() => addPlaceToActiveDay(PlaceType.FOOD)}
                        bgColor="#ffffff"
                      />
                      <PlanningCategory
                        icon={<Car className="w-8 h-8" strokeWidth={2} color="#160E53" />}
                        label="Transport"
                        isActive={activePlaceType === PlaceType.TRANSPORT}
                        onClick={() => addPlaceToActiveDay(PlaceType.TRANSPORT)}
                        bgColor="#ffffff"
                      />
                      <PlanningCategory
                        icon={<FileText className="w-8 h-8" strokeWidth={2} color="#160E53" />}
                        label="Notes"
                        isActive={activePlaceType === PlaceType.NOTE}
                        onClick={() => addPlaceToActiveDay(PlaceType.NOTE)}
                        bgColor="#ffffff"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Places Display Section */}
              <div className="flex flex-col items-start gap-6 w-full">
                {getActiveDayPlaces().length > 0 && (
                  <div className="w-full space-y-4">
                    {getActiveDayPlaces().map((place, index) => {
                      return (
                        <PlaceCard
                          key={`${activeDay}-place-${index}`}
                          place={place}
                          index={index}
                          dayKey={activeDay}
                          isExpanded={isPlaceExpanded(activeDay, index)}
                          onToggleExpansion={() =>
                            togglePlaceExpansion(activeDay, index)
                          }
                          onRemove={() => removePlaceFromActiveDay(index)}
                          onUpdateField={(field, value) =>
                            updatePlaceField(index, field, value)
                          }
                          onAddPhoto={photoKey =>
                            addPhotoToPlace(index, photoKey)
                          }
                          onRemovePhoto={photoIndex =>
                            removePhotoFromPlace(index, photoIndex)
                          }
                        />
                      );
                    })}
                  </div>
                )}

                {getActiveDayPlaces().length === 0 && (
                  <div className="w-full p-8 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
                    <p>No places added for this day. Use the categories above to add places.</p>
                  </div>
                )}

                {/* Photo Gallery */}
                {formData.photos.length > 0 && (
                  <div className="w-full">
                    <PhotoGallery
                      photos={formData.photos}
                      onRemovePhoto={handleRemovePhoto}
                      showRemoveButton={true}
                      className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="w-full lg:col-span-1 lg:sticky lg:top-4 lg:self-start" style={{ height: 'calc(100vh - 115px)' }}>
            <div className="w-full h-[500px] sm:h-[600px] lg:h-full rounded-lg bg-gray-200 relative overflow-hidden shadow-inner">
              <JourneyMap
                locations={mapLocations}
                center={getMapCenter()}
                onLocationClick={location => {
                  console.log('Location clicked:', location);
                }}
                onMapClick={handleMapClick}
              />
            </div>
          </div>
        </div>

        {/* Review Modal */}
        <JourneyReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onConfirm={handleSubmit}
          formData={{
            ...formData,
            title: journeyName || formData.title,
            description: subtitle || formData.description,
          }}
          journeyPlaces={journeyPlaces}
          days={days}
          getDateForDay={getDateForDay}
          isSubmitting={isSubmitting}
          isEditMode={true}
        />
      </div>
    </div>
  );
}
