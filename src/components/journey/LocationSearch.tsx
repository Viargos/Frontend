"use client";

import { useState, useEffect, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import InputField from "@/components/ui/InputField";
import { Location } from "@/types/journey.types";

// Static libraries array to prevent LoadScript reloading
const GOOGLE_MAPS_LIBRARIES: "places"[] = ["places"];

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationSearch({
  onLocationSelect,
  placeholder = "Search for a location...",
  className = "",
}: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    // Initialize Google Places services only when API is loaded
    if (isLoaded && window.google && window.google.maps) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
      if (mapRef.current) {
        placesService.current = new window.google.maps.places.PlacesService(
          mapRef.current
        );
      }
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
      try {
        autocompleteService.current!.getPlacePredictions(
          {
            input: searchTerm,
            types: ["geocode", "establishment"],
          },
          (predictions, status) => {
            setIsLoading(false);
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
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
        console.error("Error searching places:", error);
      }
    };

    const debounceTimer = setTimeout(searchPlaces, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSuggestionClick = (
    prediction: google.maps.places.AutocompletePrediction
  ) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ["name", "geometry", "formatted_address"],
      },
      (place, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place
        ) {
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
          className="w-full"
          disabled
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

      {/* Hidden div for PlacesService */}
      <div ref={mapRef} style={{ display: "none" }}></div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
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
