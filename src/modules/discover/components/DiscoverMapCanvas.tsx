'use client';

import type { DiscoverMapPin } from '@/modules/discover/components/MapMarkers';
import type { DiscoverFeedItem } from '@/modules/discover/types/discover-ui.types';
import { memo } from 'react';
import { FloatingPreview } from '@/modules/discover/components/FloatingPreview';
import { MapMarkers } from '@/modules/discover/components/MapMarkers';
import { DEFAULT_MAP_CONTAINER_STYLE, DEFAULT_MAP_OPTIONS, GoogleMap, InfoWindowF } from '@/modules/discover/infra';

type DiscoverMapCanvasProps = {
  center: google.maps.LatLngLiteral;
  markers: DiscoverMapPin[];
  onLoad: (map: google.maps.Map) => void;
  onMarkerHover: (markerId: string | null) => void;
  onMarkerSelect: (markerId: string) => void;
  previewItem: DiscoverFeedItem | null;
  onPreviewAction: (itemId: string) => void;
  onUnmount: () => void;
  zoom: number;
};

const DiscoverMapCanvasComponent = (props: DiscoverMapCanvasProps) => {
  const {
    center,
    markers,
    onLoad,
    onMarkerHover,
    onMarkerSelect,
    onPreviewAction,
    previewItem,
    onUnmount,
    zoom,
  } = props;

  return (
    <GoogleMap
      center={center}
      mapContainerStyle={DEFAULT_MAP_CONTAINER_STYLE}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={DEFAULT_MAP_OPTIONS}
      zoom={zoom}
    >
      <MapMarkers markers={markers} onMarkerHover={onMarkerHover} onMarkerSelect={onMarkerSelect} />
      {previewItem
        ? (
            <InfoWindowF
              options={{
                disableAutoPan: true,
                headerDisabled: true,
                maxWidth: 400,
                pixelOffset: new google.maps.Size(0, -12),
              }}
              position={{
                lat: previewItem.latitude,
                lng: previewItem.longitude,
              }}
              onCloseClick={() => onMarkerHover(null)}
            >
              <FloatingPreview item={previewItem} onOpenDetails={onPreviewAction} variant="inline" />
            </InfoWindowF>
          )
        : null}
    </GoogleMap>
  );
};

function areMapCanvasPropsEqual(previous: DiscoverMapCanvasProps, next: DiscoverMapCanvasProps) {
  return previous.center.lat === next.center.lat
    && previous.center.lng === next.center.lng
    && previous.markers === next.markers
    && previous.onLoad === next.onLoad
    && previous.onMarkerHover === next.onMarkerHover
    && previous.onMarkerSelect === next.onMarkerSelect
    && previous.onPreviewAction === next.onPreviewAction
    && previous.previewItem === next.previewItem
    && previous.onUnmount === next.onUnmount
    && previous.zoom === next.zoom;
}

export const DiscoverMapCanvas = memo(DiscoverMapCanvasComponent, areMapCanvasPropsEqual);
