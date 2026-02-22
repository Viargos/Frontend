'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  DayFilter,
  PlanningCategory,
  JourneyHeader,
  CoverImage,
  SortablePlaceCard,
  JourneyReviewModal,
} from '@/components/journey';
import { Hotel, Trees, UtensilsCrossed, Car, FileText } from 'lucide-react';
import { PlaceType, CreateJourneyPlace } from '@/types/journey.types';
import { useJourneyForm } from '@/hooks/useJourneyForm';
import { ErrorAlert } from '@/components/ui';
import PhotoGallery from '@/components/media/PhotoGallery';
import JourneyMap from '@/components/maps/JourneyMap';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';

export default function CreateJourneyPage() {
  const router = useRouter();
  const [activePlaceType] = useState<PlaceType | null>(
    null
  );
  const [journeyName, setJourneyName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { location: currentLocation } = useCurrentLocation();

  const {
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
    reorderPlaces,
    isSubmitting,
    errorMessage,
    setErrorMessage,
    submitJourneyWithData,
  } = useJourneyForm();

  const activeDayPlaces = getActiveDayPlaces();
  const placeIds = useMemo(() => activeDayPlaces.map((p) => p.id), [activeDayPlaces]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = activeDayPlaces.findIndex((p) => p.id === active.id);
      const newIndex = activeDayPlaces.findIndex((p) => p.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderPlaces(activeDay, oldIndex, newIndex);
      }
    },
    [activeDayPlaces, activeDay, reorderPlaces]
  );

  // Handle opening review modal
  const handleOpenReview = useCallback(() => {
    // Update form data with journey name and subtitle before showing review
    const updatedFormData = {
      title: journeyName || formData.title,
      description: subtitle || formData.description,
    };
    updateFormData(updatedFormData);
    setShowReviewModal(true);
  }, [journeyName, subtitle, formData.title, formData.description, updateFormData]);

  // Handle actual form submission (called from modal)
  const handleSubmit = async () => {
    // Update form data with journey name and subtitle before submission
    const updatedFormData = {
      title: journeyName || formData.title,
      description: subtitle || formData.description,
    };

    // Use a small delay to ensure state is updated, or pass the data directly
    const journeyId = await submitJourneyWithData(updatedFormData);

    if (journeyId) {
      setShowReviewModal(false);
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
      // Show marker if place has valid coordinates
      // (address without coordinates will be geocoded automatically by PlaceForm)
      const hasValidCoordinates =
        place.latitude &&
        place.longitude &&
        place.latitude !== 0 &&
        place.longitude !== 0;

      // Only add marker if we have valid coordinates
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
      } else {
      }
    });

    return locations;
  }, [getActiveDayPlaces, activeDay]);

  // Get map center based on current places or current location
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

    // Use current location if available
    if (currentLocation) {
      return {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
      };
    }

    // Fallback to world center if no location available
    return { lat: 20.0, lng: 0.0 };
  }, [getActiveDayPlaces, currentLocation]);

  // Handle map click to add new place
  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        // Add place with map coordinates
        const newPlaceId = addPlaceToActiveDay(
          activePlaceType || PlaceType.ACTIVITY,
          {
            name: 'New Place',
            latitude: lat,
            longitude: lng,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          }
        );

        // Auto-expand newly created place
        if (newPlaceId) {
          togglePlaceExpansion(newPlaceId);
        }
      }
    },
    [activePlaceType, addPlaceToActiveDay, togglePlaceExpansion]
  );

  // Handle cover image upload with key storage
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

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-none">
      <div className="flex flex-col gap-6 w-full">
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
            {/* Journey Header */}
            <JourneyHeader
              title={formData.title}
              startDate={formData.startDate}
              onTitleChange={title => updateFormData({ title })}
              onDateChange={date => updateFormData({ startDate: date })}
              onSubmit={handleOpenReview}
              isSubmitting={isSubmitting}
            />

            {/* Error Alert */}
            {errorMessage && (
              <ErrorAlert
                message={errorMessage}
                onDismiss={() => setErrorMessage(null)}
                title="Unable to create journey"
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
                {/* Show all places for active day with drag-and-drop reorder */}
                {activeDayPlaces.length > 0 && (
                  <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <SortableContext items={placeIds} strategy={verticalListSortingStrategy}>
                      <div className="w-full space-y-4">
                        {activeDayPlaces.map((place, index) => (
                          <SortablePlaceCard
                            key={place.id}
                            place={place}
                            index={index}
                            dayKey={activeDay}
                            isExpanded={isPlaceExpanded(place.id)}
                            onToggleExpansion={() => togglePlaceExpansion(place.id)}
                            onRemove={() => removePlaceFromActiveDay(index)}
                            onUpdateField={(field, value) =>
                              updatePlaceField(index, field, value)
                            }
                            onAddPhoto={(photoKey) =>
                              addPhotoToPlace(index, photoKey)
                            }
                            onRemovePhoto={(photoIndex) =>
                              removePhotoFromPlace(index, photoIndex)
                            }
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}

                {/* Default view when no places are added */}
                {activeDayPlaces.length === 0 && (
                  <div className="w-full">
                    {/* Empty state - users can add places using the category buttons above */}
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
                  // You can add additional functionality here, like highlighting the corresponding place card
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
        />
      </div>
    </div>
  );
}
