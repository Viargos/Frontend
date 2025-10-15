import { useState, useCallback } from 'react';

export interface PlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface UseGooglePlacesReturn {
  placeSuggestions: { [key: string]: PlaceSuggestion[] };
  showSuggestions: { [key: string]: boolean };
  handleAutocompletePredictions: (query: string, fieldKey: string) => void;
  handlePlaceSelect: (
    placeId: string,
    description: string,
    onLocationFound: (
      lat: number,
      lng: number,
      address: string,
      name: string
    ) => void
  ) => void;
  hideSuggestions: (fieldKey: string) => void;
}

export const useGooglePlaces = (): UseGooglePlacesReturn => {
  const [placeSuggestions, setPlaceSuggestions] = useState<{
    [key: string]: PlaceSuggestion[];
  }>({});
  const [showSuggestions, setShowSuggestions] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchTimeouts, setSearchTimeouts] = useState<{
    [key: string]: NodeJS.Timeout;
  }>({});
  const [sessionTokens, setSessionTokens] = useState<{
    [key: string]: google.maps.places.AutocompleteSessionToken;
  }>({});

  const handleAutocompletePredictions = useCallback(
    (query: string, fieldKey: string) => {
      if (!query.trim() || !window.google) return;

      // Clear existing timeout for this field
      if (searchTimeouts[fieldKey]) {
        clearTimeout(searchTimeouts[fieldKey]);
      }

      // If value is empty, hide suggestions
      if (!query.trim()) {
        setShowSuggestions(prev => ({
          ...prev,
          [fieldKey]: false,
        }));
        return;
      }

      // Set new timeout for autocomplete suggestions
      const newTimeout = setTimeout(() => {
        const service = new window.google.maps.places.AutocompleteService();

        // Create or reuse session token for this field
        if (!sessionTokens[fieldKey]) {
          setSessionTokens(prev => ({
            ...prev,
            [fieldKey]:
              new window.google.maps.places.AutocompleteSessionToken(),
          }));
        }

        service.getPlacePredictions(
          {
            input: query,
            types: ['establishment', 'geocode'],
            // Use session token to group related requests
            sessionToken: sessionTokens[fieldKey],
          },
          (predictions, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              setPlaceSuggestions(prev => ({
                ...prev,
                [fieldKey]: predictions.map(prediction => ({
                  place_id: prediction.place_id!,
                  description: prediction.description!,
                  structured_formatting: {
                    main_text:
                      prediction.structured_formatting?.main_text || '',
                    secondary_text:
                      prediction.structured_formatting?.secondary_text || '',
                  },
                })),
              }));
              setShowSuggestions(prev => ({
                ...prev,
                [fieldKey]: true,
              }));
            } else {
              setPlaceSuggestions(prev => ({
                ...prev,
                [fieldKey]: [],
              }));
              setShowSuggestions(prev => ({
                ...prev,
                [fieldKey]: false,
              }));
            }
          }
        );
      }, 300);

      setSearchTimeouts(prev => ({
        ...prev,
        [fieldKey]: newTimeout,
      }));
    },
    [searchTimeouts, sessionTokens]
  );

  const handlePlaceSelect = useCallback(
    (
      placeId: string,
      description: string,
      onLocationFound: (
        lat: number,
        lng: number,
        address: string,
        name: string
      ) => void
    ) => {
      if (!window.google) return;

      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      service.getDetails(
        {
          placeId: placeId,
          fields: ['name', 'formatted_address', 'geometry.location'],
        },
        (place, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place
          ) {
            const location = place.geometry?.location;

            if (location) {
              onLocationFound(
                location.lat(),
                location.lng(),
                place.formatted_address || description,
                place.name || description
              );
            }
          }
        }
      );
    },
    []
  );

  const hideSuggestions = useCallback((fieldKey: string) => {
    // Small delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(prev => ({
        ...prev,
        [fieldKey]: false,
      }));
    }, 150);
  }, []);

  return {
    placeSuggestions,
    showSuggestions,
    handleAutocompletePredictions,
    handlePlaceSelect,
    hideSuggestions,
  };
};
