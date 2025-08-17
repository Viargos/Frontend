"use client";

import { useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import DayFilter from "@/components/journey/DayFilter";
import PlanningCategory from "@/components/journey/PlanningCategory";
import PlaceToStayIcon from "@/components/icons/PlaceToStayIcon";
import { TreesIcon } from "@/components/icons/TreesIcon";
import { FoodIcon } from "@/components/icons/FoodIcon";
import { TransportIcon } from "@/components/icons/TransportIcon";
import { NotesIcon } from "@/components/icons/NotesIcon";
import { PlaceType, CreateJourneyPlace } from '@/types/journey.types';
import JourneyMap from '@/components/maps/JourneyMap';
import { useJourneyForm } from '@/hooks/useJourneyForm';
import { JourneyHeader } from '@/components/journey/JourneyHeader';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CoverImage } from '@/components/journey/CoverImage';
import { PlaceCard } from '@/components/journey/PlaceCard';
import PhotoGallery from '@/components/media/PhotoGallery';

export default function CreateJourneyPage() {
  const router = useRouter();
  const [activePlaceType, setActivePlaceType] = useState<PlaceType | null>(null);
  
  const {
    formData,
    updateFormData,
    days,
    activeDay,
    setActiveDay,
    addDay,
    deleteDay,
    getDateForDay,
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
    submitJourney
  } = useJourneyForm();

  // Handle form submission
  const handleSubmit = async () => {
    console.log('handleSubmit called');
    const journeyId = await submitJourney();
    console.log('submitJourney returned:', journeyId);
    console.log('Type of journeyId:', typeof journeyId);
    
    if (journeyId) {
      console.log('Redirecting to:', `/journey/${journeyId}`);
      router.push(`/journey/${journeyId}`);
    } else {
      console.log('No journey ID received, not redirecting');
    }
  };

  // Transform journey places to map locations
  const getMapLocations = useCallback(() => {
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
      if (place.latitude && place.longitude && place.latitude !== 0 && place.longitude !== 0) {
        locations.push({
          id: `${activeDay}-${index}`,
          name: place.name,
          lat: place.latitude,
          lng: place.longitude,
          type: place.type.toLowerCase(),
          address: place.address || undefined,
          day: activeDay,
        });
      }
    });

    return locations;
  }, [getActiveDayPlaces, activeDay]);

  // Get map center based on current places or default to Paris
  const getMapCenter = useCallback(() => {
    const activePlaces = getActiveDayPlaces();
    
    const placeWithCoords = activePlaces.find(place => 
      place.latitude && place.longitude && place.latitude !== 0 && place.longitude !== 0
    );
    
    if (placeWithCoords) {
      return {
        lat: placeWithCoords.latitude!,
        lng: placeWithCoords.longitude!,
      };
    }
    
    return { lat: 48.8566, lng: 2.3522 }; // Default to Paris
  }, [getActiveDayPlaces]);

  // Handle map click to add new place
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
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
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      };

      addPlaceToActiveDay(newPlace.type);
      
      // Auto-expand the newly added place
      const newIndex = getActiveDayPlaces().length;
      togglePlaceExpansion(activeDay, newIndex);
    }
  }, [activePlaceType, activeDay, addPlaceToActiveDay, getActiveDayPlaces, togglePlaceExpansion]);

  // Handle cover image upload with key storage
  const handleCoverImageUpload = useCallback((url: string, key?: string) => {
    updateFormData({ 
      coverImageUrl: url,
      coverImageKey: key || null
    });
  }, [updateFormData]);

  // Handle photo removal
  const handleRemovePhoto = useCallback((index: number) => {
    const updatedPhotos = formData.photos.filter((_, i) => i !== index);
    updateFormData({ photos: updatedPhotos });
  }, [formData.photos, updateFormData]);


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex p-6 flex-col items-center gap-6 flex-1 rounded-lg shadow-lg relative">
        {/* Hero Cover Image */}
        <CoverImage
          imageUrl={formData.coverImageUrl}
          onImageUpload={handleCoverImageUpload}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
          {/* Left Content */}
          <div className="flex flex-col items-start gap-8 w-full md:col-span-7">
            {/* Journey Header */}
            <JourneyHeader
              title={formData.title}
              startDate={formData.startDate}
              onTitleChange={(title) => updateFormData({ title })}
              onDateChange={(date) => updateFormData({ startDate: date })}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />

            {/* Error Alert */}
            {errorMessage && (
              <ErrorAlert
                message={errorMessage}
                onDismiss={() => setErrorMessage(null)}
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
                <div className="flex p-6 flex-col justify-center items-start gap-6 w-full rounded-lg border-b border-gray-300 bg-white">
                  <div className="flex flex-col justify-center items-start gap-8 w-full">
                    {/* Day Header */}
                    <div className="flex min-w-32 flex-col items-start gap-2 w-full">
                      <div className="text-gray-600 font-manrope text-sm font-normal leading-5 w-full">
                        {activeDay}
                      </div>
                      <div className="text-gray-900 font-manrope text-base font-semibold leading-6 w-full">
                        {getDateForDay(activeDay)}
                      </div>
                    </div>

                    {/* Planning Categories */}
                    <div className="flex flex-wrap items-center gap-4">
                      <PlanningCategory
                        icon={<PlaceToStayIcon />}
                        label="Place to stay"
                        isActive={activePlaceType === PlaceType.STAY}
                        onClick={() => addPlaceToActiveDay(PlaceType.STAY)}
                      />
                      <PlanningCategory
                        icon={<TreesIcon className="text-black" />}
                        label="Places to go"
                        isActive={activePlaceType === PlaceType.ACTIVITY}
                        onClick={() => addPlaceToActiveDay(PlaceType.ACTIVITY)}
                      />
                      <PlanningCategory
                        icon={<FoodIcon className="text-black" />}
                        label="Food"
                        isActive={activePlaceType === PlaceType.FOOD}
                        onClick={() => addPlaceToActiveDay(PlaceType.FOOD)}
                      />
                      <PlanningCategory
                        icon={<TransportIcon className="text-black w-10 h-4" />}
                        label="Transport"
                        isActive={activePlaceType === PlaceType.TRANSPORT}
                        onClick={() => addPlaceToActiveDay(PlaceType.TRANSPORT)}
                      />
                      <PlanningCategory
                        icon={<NotesIcon className="text-black" />}
                        label="Notes"
                        isActive={activePlaceType === PlaceType.NOTE}
                        onClick={() => addPlaceToActiveDay(PlaceType.NOTE)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Places Display Section */}
              <div className="flex flex-col items-start gap-6 w-full">
                {/* Show all places for active day using PlaceCard components */}
                {getActiveDayPlaces().length > 0 && (
                  <div className="w-full space-y-4">
                    {getActiveDayPlaces().map((place, index) => (
                      <PlaceCard
                        key={index}
                        place={place}
                        index={index}
                        dayKey={activeDay}
                        isExpanded={isPlaceExpanded(activeDay, index)}
                        onToggleExpansion={() => togglePlaceExpansion(activeDay, index)}
                        onRemove={() => removePlaceFromActiveDay(index)}
                        onUpdateField={(field, value) => updatePlaceField(index, field, value)}
                        onAddPhoto={(photoKey) => addPhotoToPlace(index, photoKey)}
                        onRemovePhoto={(photoIndex) => removePhotoFromPlace(index, photoIndex)}
                      />
                    ))}
                  </div>
                )}

                {/* Default view when no places are added */}
                {getActiveDayPlaces().length === 0 && (
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
                      className="bg-white p-4 rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="w-full md:col-span-5 h-full relative">
            <div className="w-full h-[724px] rounded-lg bg-gray-200 relative overflow-hidden shadow-inner">
              <JourneyMap
                locations={getMapLocations()}
                center={getMapCenter()}
                onLocationClick={(location) => {
                  console.log('Location clicked:', location);
                  // You can add additional functionality here, like highlighting the corresponding place card
                }}
                onMapClick={handleMapClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
