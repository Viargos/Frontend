'use client';

import { useState, useEffect, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import InputField from '@/components/ui/InputField';
import { googleMapsCache } from '@/lib/google-maps-cache';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
}

// Static libraries array to prevent LoadScript reloading
const GOOGLE_MAPS_LIBRARIES: 'places'[] = ['places'];

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationSearch({
  onLocationSelect,
  placeholder = 'Search for a location...',
  className = '',
}: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    // Initialize Google Places services only when API is loaded
    if (isLoaded && window.google && window.google.maps) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
      // Create a dummy div for PlacesService since we don't need a map element
      const dummyDiv = document.createElement('div');
      placesService.current = new window.google.maps.places.PlacesService(
        dummyDiv
      ) as google.maps.places.PlacesService;
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!searchTerm.trim() || !autocompleteService.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchPlaces = async () => {
      setIsLoading(true);

      // Check cache first
      const cacheKey = {
        input: searchTerm,
        types: ['geocode', 'establishment'],
      };
      const cachedResults = googleMapsCache.get<
        google.maps.places.AutocompletePrediction[]
      >('autocomplete', cacheKey);

      if (cachedResults) {
        setSuggestions(cachedResults);
        setShowSuggestions(true);
        setIsLoading(false);
        return;
      }

      try {
        autocompleteService.current!.getPlacePredictions(
          {
            input: searchTerm,
            types: ['geocode', 'establishment'],
          },
          (predictions, status) => {
            setIsLoading(false);
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              // Cache the results
              googleMapsCache.set(
                'autocomplete',
                cacheKey,
                predictions,
                5 * 60 * 1000
              ); // 5 minutes
              setSuggestions(predictions);
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
          }
        );
      } catch (error) {
        setIsLoading(false);
        console.error('Error searching places:', error);
      }
    };

    const debounceTimer = setTimeout(searchPlaces, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSuggestionClick = (
    prediction: google.maps.places.AutocompletePrediction
  ) => {
    if (!placesService.current) return;

    // Check cache for place details
    const cacheKey = {
      placeId: prediction.place_id,
      fields: ['name', 'geometry.location', 'formatted_address'],
    };
    const cachedPlace = googleMapsCache.get<google.maps.places.PlaceResult>(
      'placeDetails',
      cacheKey
    );

    if (cachedPlace) {
      const location: Location = {
        id: prediction.place_id,
        name: cachedPlace.name || prediction.description,
        latitude: cachedPlace.geometry?.location?.lat() || 0,
        longitude: cachedPlace.geometry?.location?.lng() || 0,
        address: cachedPlace.formatted_address || prediction.description,
      };

      onLocationSelect(location);
      setSearchTerm(cachedPlace.name || prediction.description);
      setShowSuggestions(false);
      return;
    }

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['name', 'geometry.location', 'formatted_address'],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          // Cache the place details
          googleMapsCache.set('placeDetails', cacheKey, place, 10 * 60 * 1000); // 10 minutes

          const location: Location = {
            id: prediction.place_id,
            name: place.name || prediction.description,
            latitude: place.geometry?.location?.lat() || 0,
            longitude: place.geometry?.location?.lng() || 0,
            address: place.formatted_address || prediction.description,
          };

          onLocationSelect(location);
          setSearchTerm(place.name || prediction.description);
          setShowSuggestions(false);
        }
      }
    );
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setShowSuggestions(false);
    }
  };

  // Show loading state if Google Maps API is not loaded
  if (!isLoaded) {
    return (
      <div className={`relative ${className}`}>
        <InputField
          placeholder="Loading location search..."
          value=""
          onChange={() => {}}
          className="w-full opacity-50 cursor-not-allowed"
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <InputField
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        className="w-full"
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map(suggestion => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">
                {suggestion.structured_formatting?.main_text}
              </div>
              <div className="text-sm text-gray-500">
                {suggestion.structured_formatting?.secondary_text}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
