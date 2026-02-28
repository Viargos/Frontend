'use client';

import type { DiscoverMapPin } from '@/modules/discover/components/MapMarkers';
import { memo } from 'react';
import { MapMarkers } from '@/modules/discover/components/MapMarkers';
import { DEFAULT_MAP_CONTAINER_STYLE, DEFAULT_MAP_OPTIONS, GoogleMap } from '@/modules/discover/infra';

type DiscoverMapCanvasProps = {
  center: google.maps.LatLngLiteral;
  hasCoordinates: boolean;
  markers: DiscoverMapPin[];
  onLoad: (map: google.maps.Map) => void;
  onUnmount: () => void;
};

const DiscoverMapCanvasComponent = (props: DiscoverMapCanvasProps) => {
  const { center, hasCoordinates, markers, onLoad, onUnmount } = props;

  return (
    <GoogleMap
      center={center}
      mapContainerStyle={DEFAULT_MAP_CONTAINER_STYLE}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={DEFAULT_MAP_OPTIONS}
      zoom={hasCoordinates ? 11 : markers.length > 0 ? 4 : 2}
    >
      <MapMarkers markers={markers} />
    </GoogleMap>
  );
};

function areMapCanvasPropsEqual(previous: DiscoverMapCanvasProps, next: DiscoverMapCanvasProps) {
  return previous.center.lat === next.center.lat
    && previous.center.lng === next.center.lng
    && previous.hasCoordinates === next.hasCoordinates
    && previous.markers === next.markers
    && previous.onLoad === next.onLoad
    && previous.onUnmount === next.onUnmount;
}

export const DiscoverMapCanvas = memo(DiscoverMapCanvasComponent, areMapCanvasPropsEqual);
