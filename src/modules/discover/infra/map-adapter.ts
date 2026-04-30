'use client';

export {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_CONTAINER_STYLE,
  DEFAULT_MAP_OPTIONS,
  GoogleMap,
  GoogleMarkerClusterer,
  hasGoogleMapsApiKey,
  InfoWindowF,
  MarkerF,
  useGoogleMapsLoader,
} from '@/modules/common/infra';

export type MapCoordinates = {
  lat: number;
  lng: number;
};

export type MapAdapterConfig = {
  center: MapCoordinates;
  zoom: number;
};
