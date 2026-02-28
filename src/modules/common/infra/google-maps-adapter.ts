'use client';

import type { Libraries } from '@react-google-maps/api';
import { GoogleMap, GoogleMarkerClusterer, MarkerF, PolylineF, useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_LOADER_ID = 'viargos-google-maps-loader';

const GOOGLE_MAPS_LIBRARIES: Libraries = ['places'];

export const DEFAULT_MAP_CENTER = {
  lat: 20,
  lng: 0,
} as const;

export const DEFAULT_MAP_CONTAINER_STYLE = {
  height: '100%',
  width: '100%',
} as const;

export const DEFAULT_MAP_OPTIONS: google.maps.MapOptions = {
  clickableIcons: false,
  fullscreenControl: false,
  mapTypeControl: false,
  streetViewControl: false,
};

export function hasGoogleMapsApiKey() {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
}

export function useGoogleMapsLoader(_loaderId?: string) {
  const hasApiKey = hasGoogleMapsApiKey();
  const loader = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    id: GOOGLE_MAPS_LOADER_ID,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  return {
    hasApiKey,
    isLoaded: loader.isLoaded,
    loadError: loader.loadError,
  };
}

export { GoogleMap, GoogleMarkerClusterer, MarkerF, PolylineF, useJsApiLoader };
