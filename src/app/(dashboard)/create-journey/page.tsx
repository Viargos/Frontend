"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DayFilter from "@/components/journey/DayFilter";
import PlanningCategory from "@/components/journey/PlanningCategory";
import PlaceToStayIcon from "@/components/icons/PlaceToStayIcon";
import { TreesIcon } from "@/components/icons/TreesIcon";
import { FoodIcon } from "@/components/icons/FoodIcon";
import { TransportIcon } from "@/components/icons/TransportIcon";
import { NotesIcon } from "@/components/icons/NotesIcon";
import Button from "@/components/ui/Button";
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PlaceType, CreateJourneyDto, CreateJourneyPlace, CreateComprehensiveJourneyDto, CreateJourneyDay } from '@/types/journey.types';
import JourneyMap from '@/components/maps/JourneyMap';
import apiClient from '@/lib/api.legacy';

export default function CreateJourneyPage() {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [activeDay, setActiveDay] = useState("Day 1");
  const [days, setDays] = useState(["Day 1"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("A Wonderful Trip to Paris");
  const [description, setDescription] = useState("An exciting 2-day itinerary exploring the best of Paris, from iconic landmarks to charming neighborhoods.");
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activePlaceType, setActivePlaceType] = useState<PlaceType | null>(null);
  const [journeyPlaces, setJourneyPlaces] = useState<{
    [key: string]: CreateJourneyPlace[];
  }>({
    "Day 1": []
  });
  const [expandedPlaces, setExpandedPlaces] = useState<{
    [key: string]: boolean;
  }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCategorySelect = (category: PlaceType) => {
    setActivePlaceType(activePlaceType === category ? null : category);
  };

  const addDay = () => {
    const newDayNumber = days.length + 1;
    const newDayLabel = `Day ${newDayNumber}`;
    
    // Add the new day to the days array
    setDays(prev => [...prev, newDayLabel]);
    
    // Initialize empty places array for the new day
    setJourneyPlaces(prev => ({
      ...prev,
      [newDayLabel]: []
    }));
    
    // Switch to the newly added day
    setActiveDay(newDayLabel);
  };

  const deleteDay = (dayToDelete: string) => {
    // Don't allow deleting if it's the only day
    if (days.length <= 1) return;
    
    // Remove the day from days array
    const updatedDays = days.filter(day => day !== dayToDelete);
    
    // Reorder the remaining days to maintain sequential numbering
    const reorderedDays = updatedDays.map((_, index) => `Day ${index + 1}`);
    setDays(reorderedDays);
    
    // Create new places object with reordered day keys
    setJourneyPlaces(prev => {
      const newPlaces: { [key: string]: CreateJourneyPlace[] } = {};
      let currentIndex = 0;
      
      updatedDays.forEach(oldDay => {
        if (oldDay !== dayToDelete) {
          const newDayKey = `Day ${currentIndex + 1}`;
          newPlaces[newDayKey] = prev[oldDay] || [];
          currentIndex++;
        }
      });
      
      return newPlaces;
    });
    
    // If the deleted day was the active day, switch to the first available day
    if (activeDay === dayToDelete) {
      setActiveDay('Day 1');
    } else {
      // Update active day to match the new numbering
      const oldActiveIndex = days.indexOf(activeDay);
      const deletedIndex = days.indexOf(dayToDelete);
      
      if (oldActiveIndex > deletedIndex) {
        // Active day comes after deleted day, so its number decreases by 1
        const newActiveIndex = oldActiveIndex - 1;
        setActiveDay(`Day ${newActiveIndex + 1}`);
      }
      // If active day comes before deleted day, its number stays the same
    }
  };

  // Helper function to get date for a specific day
  const getDateForDay = (dayLabel: string): string => {
    const dayNumber = parseInt(dayLabel.split(' ')[1]) - 1; // Convert "Day 1" to 0, "Day 2" to 1, etc.
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + dayNumber);
    
    return targetDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleReviewPost = async () => {
    setIsSubmitting(true);
    setErrorMessage(null); // Clear any previous errors
    
    try {
      // Debug: Check if token exists
      const token = localStorage.getItem('viargos_auth_token');
      console.log('Token in localStorage:', token ? 'EXISTS' : 'MISSING');
      console.log('Token length:', token ? token.length : 0);
      
      // Build comprehensive journey data with all days and places
      const journeyDays: CreateJourneyDay[] = days.map((dayLabel, index) => {
        const dayNumber = parseInt(dayLabel.split(' ')[1]); // Extract day number from "Day 1", "Day 2", etc.
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + index); // Add index days to start date
        
        // Get places for this day (excluding NOTE type places as they should be day notes)
        const dayPlaces = (journeyPlaces[dayLabel] || []).filter(place => place.type !== PlaceType.NOTE);
        
        // Get notes for this day (NOTE type places become day notes)
        const notePlace = (journeyPlaces[dayLabel] || []).find(place => place.type === PlaceType.NOTE);
        const dayNotes = notePlace ? notePlace.description || '' : '';
        
        return {
          dayNumber: dayNumber - 1, // API expects 0-based day numbers
          date: dayDate.toISOString(),
          notes: dayNotes,
          places: dayPlaces.map(place => ({
            type: place.type,
            name: place.name,
            description: place.description || '',
            startTime: place.startTime || '',
            endTime: place.endTime || '',
            address: place.address || '',
            latitude: place.latitude || null,
            longitude: place.longitude || null
          }))
        };
      });
      
      const journeyData = {
        title,
        description,
        days: journeyDays
      };
      
      console.log('Sending comprehensive journey data:', journeyData);

      const response = await apiClient.createJourney(journeyData as any);
      console.log('API Response:', response);
      
      // Check if we have a successful response
      if (!response || (!response.data && response.statusCode !== 200 && response.statusCode !== 201)) {
        throw new Error(response?.message || 'Failed to create journey');
      }

      // Check if we have journey data
      if (!response.data || !response.data.id) {
        throw new Error('No journey data or ID returned from server');
      }
      
      console.log('Journey created successfully:', response.data);
      
      // Navigate to the created journey
      router.push(`/journey/${response.data.id}`);
    } catch (error: any) {
      console.error('Failed to create journey:', error);
      console.log('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        statusCode: error.statusCode
      });
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred while creating your journey. Please try again.';
      setErrorMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActiveDayPlaces = () => {
    return journeyPlaces[activeDay] || [];
  };

  const getPlacesByType = (type: PlaceType) => {
    return getActiveDayPlaces().filter(place => place.type === type);
  };

  const addPlaceToActiveDay = (type: PlaceType) => {
    // Check if this is a NOTE type and if one already exists for this day
    if (type === PlaceType.NOTE) {
      const existingPlaces = journeyPlaces[activeDay] || [];
      const hasExistingNote = existingPlaces.some(place => place.type === PlaceType.NOTE);
      
      if (hasExistingNote) {
        // Don't add another note, just return early
        return;
      }
    }

    const newPlace: CreateJourneyPlace = {
      name: getPlaceholderName(type),
      description: '',
      type: type,
      startTime: '09:00',
      endTime: '10:00',
      latitude: 0, // Don't set default coordinates
      longitude: 0, // Don't set default coordinates
      address: '' // Don't set default address
    };

    setJourneyPlaces(prev => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] || []), newPlace]
    }));
  };

  const removePlaceFromActiveDay = (index: number) => {
    setJourneyPlaces(prev => ({
      ...prev,
      [activeDay]: (prev[activeDay] || []).filter((_, i) => i !== index)
    }));
  };

  const getPlaceholderName = (type: PlaceType) => {
    switch (type) {
      case PlaceType.STAY:
        return 'New Hotel';
      case PlaceType.ACTIVITY:
        return 'New Activity';
      case PlaceType.FOOD:
        return 'New Restaurant';
      case PlaceType.TRANSPORT:
        return 'New Transport';
      case PlaceType.NOTE:
        return 'New Note';
      default:
        return 'New Place';
    }
  };

  const updatePlaceField = (index: number, field: keyof CreateJourneyPlace, value: string | number) => {
    setJourneyPlaces(prev => ({
      ...prev,
      [activeDay]: (prev[activeDay] || []).map((place, i) => 
        i === index ? { ...place, [field]: value } : place
      )
    }));
  };

  // Handle location search using Google Places API
  const handleLocationSearch = useCallback(async (query: string, placeIndex: number) => {
    if (!query.trim() || !window.google) return;

    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    const request = {
      query: query,
      fields: ['name', 'formatted_address', 'geometry']
    };

    service.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
        const place = results[0];
        const location = place.geometry?.location;
        
        if (location) {
          // Update the place with the found coordinates and address
          setJourneyPlaces(prev => ({
            ...prev,
            [activeDay]: (prev[activeDay] || []).map((p, i) => 
              i === placeIndex ? {
                ...p,
                latitude: location.lat(),
                longitude: location.lng(),
                address: place.formatted_address || query
              } : p
            )
          }));
        }
      } else {
        console.log('Place search failed:', status);
      }
    });
  }, [activeDay]);

  // State for autocomplete suggestions
  const [placeSuggestions, setPlaceSuggestions] = useState<{
    [key: string]: google.maps.places.AutocompletePrediction[];
  }>({});
  const [showSuggestions, setShowSuggestions] = useState<{[key: string]: boolean}>({});
  const [searchTimeouts, setSearchTimeouts] = useState<{[key: string]: NodeJS.Timeout}>({});
  
  // Handle autocomplete predictions
  const handleAutocompletePredictions = useCallback(async (query: string, placeIndex: number) => {
    if (!query.trim() || !window.google) return;

    const service = new window.google.maps.places.AutocompleteService();
    const fieldKey = `${activeDay}-${placeIndex}`;
    
    service.getPlacePredictions(
      {
        input: query,
        types: ['establishment', 'geocode']
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPlaceSuggestions(prev => ({
            ...prev,
            [fieldKey]: predictions
          }));
          setShowSuggestions(prev => ({
            ...prev,
            [fieldKey]: true
          }));
        } else {
          setPlaceSuggestions(prev => ({
            ...prev,
            [fieldKey]: []
          }));
          setShowSuggestions(prev => ({
            ...prev,
            [fieldKey]: false
          }));
        }
      }
    );
  }, [activeDay]);

  // Handle place selection from suggestions
  const handlePlaceSelect = useCallback((placeId: string, description: string, placeIndex: number) => {
    if (!window.google) return;

    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );
    
    service.getDetails(
      {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'geometry']
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const location = place.geometry?.location;
          
          if (location) {
            // Update the place with the selected location data
            setJourneyPlaces(prev => ({
              ...prev,
              [activeDay]: (prev[activeDay] || []).map((p, i) => 
                i === placeIndex ? {
                  ...p,
                  name: place.name || description, // Update the place name
                  latitude: location.lat(),
                  longitude: location.lng(),
                  address: place.formatted_address || description
                } : p
              )
            }));
            
            // Hide suggestions
            const fieldKey = `${activeDay}-${placeIndex}`;
            setShowSuggestions(prev => ({
              ...prev,
              [fieldKey]: false
            }));
          }
        }
      }
    );
  }, [activeDay]);
  
  const handleAddressChange = useCallback((index: number, value: string) => {
    // Update the field immediately for UI responsiveness
    updatePlaceField(index, 'address', value);
    
    const fieldKey = `${activeDay}-${index}`;
    
    // Clear existing timeout for this field
    if (searchTimeouts[fieldKey]) {
      clearTimeout(searchTimeouts[fieldKey]);
    }
    
    // If value is empty, hide suggestions
    if (!value.trim()) {
      setShowSuggestions(prev => ({
        ...prev,
        [fieldKey]: false
      }));
      return;
    }
    
    // Set new timeout for autocomplete suggestions
    const newTimeout = setTimeout(() => {
      handleAutocompletePredictions(value, index);
    }, 300); // Shorter delay for better UX
    
    setSearchTimeouts(prev => ({
      ...prev,
      [fieldKey]: newTimeout
    }));
  }, [activeDay, handleAutocompletePredictions, searchTimeouts]);

  // Handle clicking outside to close suggestions
  const handleSuggestionBlur = useCallback((index: number) => {
    const fieldKey = `${activeDay}-${index}`;
    // Small delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(prev => ({
        ...prev,
        [fieldKey]: false
      }));
    }, 150);
  }, [activeDay]);

  const togglePlaceExpansion = (dayKey: string, placeIndex: number) => {
    const key = `${dayKey}-${placeIndex}`;
    setExpandedPlaces(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isPlaceExpanded = (dayKey: string, placeIndex: number) => {
    const key = `${dayKey}-${placeIndex}`;
    return expandedPlaces[key] || false;
  };

  // Transform journey places to map locations
  const getMapLocations = () => {
    const locations: Array<{
      id: string;
      name: string;
      lat: number;
      lng: number;
      type: string;
      address?: string;
      day?: string;
    }> = [];

    // Only add places from the active day that have valid coordinates
    const activeDayPlaces = journeyPlaces[activeDay] || [];
    activeDayPlaces.forEach((place, index) => {
      // Only include places that have valid coordinates (not 0,0 or undefined)
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
  };

  // Get map center based on current places or default to Paris
  const getMapCenter = () => {
    const activePlaces = getActiveDayPlaces();
    
    // Find the first place with valid coordinates
    const placeWithCoords = activePlaces.find(place => 
      place.latitude && place.longitude && place.latitude !== 0 && place.longitude !== 0
    );
    
    if (placeWithCoords) {
      return {
        lat: placeWithCoords.latitude!,
        lng: placeWithCoords.longitude!,
      };
    }
    
    // Default to Paris if no places have coordinates
    return { lat: 48.8566, lng: 2.3522 };
  };

  // Handle map click to add new place
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      // Create a new place at the clicked location
      // Default to ACTIVITY type, but you could make this configurable
      const newPlace: CreateJourneyPlace = {
        name: 'New Place',
        description: '',
        type: activePlaceType || PlaceType.ACTIVITY, // Use selected type or default to ACTIVITY
        startTime: '09:00',
        endTime: '10:00',
        latitude: lat,
        longitude: lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` // Temporary address with coordinates
      };

      setJourneyPlaces(prev => ({
        ...prev,
        [activeDay]: [...(prev[activeDay] || []), newPlace]
      }));

      // Optionally, you can expand the newly added place for immediate editing
      const newIndex = (journeyPlaces[activeDay] || []).length;
      const key = `${activeDay}-${newIndex}`;
      setExpandedPlaces(prev => ({
        ...prev,
        [key]: true
      }));
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsCoverUploading(true);
    try {
      // Create a temporary URL for immediate display
      const temporaryUrl = URL.createObjectURL(file);
      setCoverImageUrl(temporaryUrl);

      // Here you would typically upload to your server/cloud storage
      // For now, we'll simulate an upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Cover image uploaded:', file.name);
    } catch (error) {
      console.error('Failed to upload cover image:', error);
      setCoverImageUrl(null);
    } finally {
      setIsCoverUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex p-6 flex-col items-center gap-6 flex-1 rounded-lg shadow-lg relative">
        {/* Hero Image with Change Cover Button */}
        <div className="relative w-full flex-1">
          <img
            src={coverImageUrl || "/london.png?format=webp&width=800"}
            alt="Journey destination"
            className="w-full h-full rounded-lg object-cover"
          />
          
          {/* Change Cover Button */}
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={isCoverUploading}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-md text-sm hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCoverUploading ? (
              <>
                <LoadingSpinner size="sm" />
                Uploading...
              </>
            ) : (
              'Change Cover'
            )}
          </button>
          
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
            disabled={isCoverUploading}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
          {/* Left Content */}
          <div className="flex flex-col items-start gap-8 w-full md:col-span-7">
            {/* Header */}
            <div className="flex pb-3 items-center gap-3 w-full border-b border-gray-300">
              <h1 className="flex-1 text-black font-outfit text-2xl font-medium leading-[120%]">
                Journey Details
              </h1>
              
              {/* Date Selector */}
              <div className="relative flex items-center gap-2">
                <span className="text-black font-manrope text-sm font-normal">
                  {startDate.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                
                {/* Date Picker Dropdown */}
                {showDatePicker && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                    <input
                      type="date"
                      value={startDate.toISOString().split('T')[0]}
                      onChange={(e) => {
                        setStartDate(new Date(e.target.value));
                        setShowDatePicker(false);
                      }}
                      className="border border-gray-300 rounded px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    />
                  </div>
                )}
              </div>
              
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleReviewPost}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Review & Post'}
              </Button>
            </div>

            {/* Error Display */}
            {errorMessage && (
              <AnimatePresence>
                <motion.div 
                  className="w-full bg-red-50 border border-red-200 rounded-lg p-4"
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-red-800 font-medium text-sm mb-1">
                        Unable to create journey
                      </h4>
                      <p className="text-red-700 text-sm">
                        {errorMessage}
                      </p>
                    </div>
                    <button
                      onClick={() => setErrorMessage(null)}
                      className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors"
                      title="Dismiss error"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
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
                    <div className="flex items-center gap-4">
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
                {/* Show all places for active day */}
                {getActiveDayPlaces().length > 0 && (
                  <div className="w-full space-y-4">
                    {getActiveDayPlaces().map((place, index) => {
                      const isExpanded = isPlaceExpanded(activeDay, index);
                      return (
                        <motion.div 
                          key={index}
                          className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          {/* Accordion Header - Always Visible */}
                          <motion.div 
                            className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => togglePlaceExpansion(activeDay, index)}
                            whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                            whileTap={{ scale: 0.998 }}
                          >
                            <div className="flex items-center gap-3">
                              <motion.div 
                                className="flex min-w-10 min-h-10 flex-col justify-center items-center gap-2 rounded-full border border-gray-200 bg-gray-100"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                <div className="w-5 h-5 opacity-70">
                                  {place.type === PlaceType.STAY && <PlaceToStayIcon />}
                                  {place.type === PlaceType.ACTIVITY && <TreesIcon className="text-black" />}
                                  {place.type === PlaceType.FOOD && <FoodIcon className="text-black" />}
                                  {place.type === PlaceType.TRANSPORT && <TransportIcon className="text-black" />}
                                  {place.type === PlaceType.NOTE && <NotesIcon className="text-black" />}
                                </div>
                              </motion.div>
                              <div className="flex flex-col items-start gap-1">
                                <div className="text-black font-manrope text-sm font-semibold leading-5">
                                  {place.name}
                                </div>
                                <AnimatePresence>
                                  {!isExpanded && place.startTime && place.endTime && (
                                    <motion.div 
                                      className="text-gray-500 font-manrope text-xs font-normal leading-4"
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      {place.startTime} - {place.endTime}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Remove Button */}
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePlaceFromActiveDay(index);
                                }}
                                className="p-1 hover:bg-red-50 rounded transition-colors"
                                title="Remove place"
                                whileHover={{ scale: 1.1, backgroundColor: "rgba(254, 242, 242, 1)" }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </motion.button>
                              {/* Expand/Collapse Icon */}
                              <motion.svg 
                                className="w-4 h-4 text-gray-500" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </motion.svg>
                            </div>
                          </motion.div>

                          {/* Accordion Content - Form Fields */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                className="border-t border-gray-200 p-4"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                style={{ overflow: "hidden" }}
                              >
                                <motion.div 
                                  className="w-full space-y-3"
                                  initial={{ y: -20 }}
                                  animate={{ y: 0 }}
                                  exit={{ y: -20 }}
                                  transition={{ duration: 0.2, delay: 0.1 }}
                                >
                                {place.type === PlaceType.NOTE ? (
                                  // Simplified Notes field - just a textarea
                                  <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                      Notes
                                    </label>
                                    <textarea
                                      value={place.description || ''}
                                      onChange={(e) => updatePlaceField(index, 'description', e.target.value)}
                                      placeholder="Add your notes here..."
                                      rows={4}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none"
                                    />
                                  </div>
                                ) : (
                                  // Regular place fields for all other types
                                  <>
                                    {/* Name Field */}
                                    <div>
                                      <label className="block text-sm font-medium text-black mb-1">
                                        Name *
                                      </label>
                                      <input
                                        type="text"
                                        value={place.name}
                                        onChange={(e) => updatePlaceField(index, 'name', e.target.value)}
                                        placeholder="Enter place name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                      />
                                    </div>

                                    {/* Description Field */}
                                    <div>
                                      <label className="block text-sm font-medium text-black mb-1">
                                        Description
                                      </label>
                                      <textarea
                                        value={place.description || ''}
                                        onChange={(e) => updatePlaceField(index, 'description', e.target.value)}
                                        placeholder="Enter description"
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none"
                                      />
                                    </div>

                                    {/* Time Fields */}
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-sm font-medium text-black mb-1">
                                          Start Time
                                        </label>
                                        <input
                                          type="time"
                                          value={place.startTime || ''}
                                          onChange={(e) => updatePlaceField(index, 'startTime', e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-black mb-1">
                                          End Time
                                        </label>
                                        <input
                                          type="time"
                                          value={place.endTime || ''}
                                          onChange={(e) => updatePlaceField(index, 'endTime', e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                        />
                                      </div>
                                    </div>

                                    {/* Location/Address Field with Autocomplete */}
                                    <div>
                                      <label className="block text-sm font-medium text-black mb-1">
                                        Location/Address *
                                      </label>
                                      <div className="relative">
                                        <input
                                          type="text"
                                          value={place.address || ''}
                                          onChange={(e) => handleAddressChange(index, e.target.value)}
                                          onBlur={() => handleSuggestionBlur(index)}
                                          placeholder="Search for a location (e.g., Eiffel Tower, Paris)"
                                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                          autoComplete="off"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                          </svg>
                                        </div>
                                        
                                        {/* Autocomplete Suggestions Dropdown */}
                                        {showSuggestions[`${activeDay}-${index}`] && placeSuggestions[`${activeDay}-${index}`]?.length > 0 && (
                                          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {placeSuggestions[`${activeDay}-${index}`].map((suggestion, suggestionIndex) => (
                                              <button
                                                key={suggestion.place_id}
                                                type="button"
                                                className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                                                onMouseDown={(e) => {
                                                  e.preventDefault(); // Prevent input blur
                                                  handlePlaceSelect(suggestion.place_id, suggestion.description, index);
                                                }}
                                              >
                                                <div className="flex items-start gap-2">
                                                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                  </svg>
                                                  <div className="flex-1 min-w-0">
                                                    <div className="text-sm text-black font-medium truncate">
                                                      {suggestion.structured_formatting.main_text}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate">
                                                      {suggestion.structured_formatting.secondary_text}
                                                    </div>
                                                  </div>
                                                </div>
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">
                                        Start typing to see location suggestions
                                      </p>
                                      {place.latitude && place.longitude && (
                                        <p className="text-xs text-green-600 mt-1">
                                          ✓ Location found: {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
                                        </p>
                                      )}
                                    </div>
                                  </>
                                )}
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Default view when no places are added */}
                {getActiveDayPlaces().length === 0 && (
                  <div className="w-full">
                    {/* Empty state - users can add places using the category buttons above */}
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
