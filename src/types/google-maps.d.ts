declare global {
  interface Window {
    google: typeof google;
  }
}

// Extend Google Maps types for Places API
declare namespace google.maps.places {
  interface AutocompletePrediction {
    place_id: string;
    description: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
  }

  interface PlaceResult {
    name?: string;
    geometry?: {
      location?: google.maps.LatLng;
    };
    formatted_address?: string;
  }

  class AutocompleteService {
    getPlacePredictions(
      request: {
        input: string;
        types?: string[];
      },
      callback: (
        predictions: AutocompletePrediction[] | null,
        status: PlacesServiceStatus
      ) => void
    ): void;
  }

  class PlacesService {
    constructor(attrContainer: HTMLDivElement | google.maps.Map);
    getDetails(
      request: {
        placeId: string;
        fields: string[];
      },
      callback: (
        result: PlaceResult | null,
        status: PlacesServiceStatus
      ) => void
    ): void;
  }

  enum PlacesServiceStatus {
    OK = "OK",
    ZERO_RESULTS = "ZERO_RESULTS",
    OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
    REQUEST_DENIED = "REQUEST_DENIED",
    INVALID_REQUEST = "INVALID_REQUEST",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
  }
}

export {};
