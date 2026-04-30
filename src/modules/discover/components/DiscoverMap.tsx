'use client';

import type { DiscoverFeedItem } from '@/modules/discover/types/discover-ui.types';
import { memo, useMemo } from 'react';
import { DiscoverMapCanvas } from '@/modules/discover/components/DiscoverMapCanvas';

type DiscoverMapProps = {
  center: google.maps.LatLngLiteral;
  hoveredItemId: string | null;
  items: DiscoverFeedItem[];
  selectedItemId: string | null;
  onLoad: (map: google.maps.Map) => void;
  onMarkerHover: (itemId: string | null) => void;
  onMarkerSelect: (itemId: string) => void;
  onPreviewAction: (itemId: string) => void;
  previewItem: DiscoverFeedItem | null;
  onUnmount: () => void;
  zoom: number;
};

const DiscoverMapComponent = (props: DiscoverMapProps) => {
  const {
    center,
    hoveredItemId,
    items,
    onLoad,
    onMarkerHover,
    onMarkerSelect,
    onPreviewAction,
    previewItem,
    onUnmount,
    selectedItemId,
    zoom,
  } = props;

  const markers = useMemo(() => items.map(item => ({
    id: item.id,
    isHovered: hoveredItemId === item.id,
    isSelected: selectedItemId === item.id,
    position: {
      lat: item.latitude,
      lng: item.longitude,
    },
    title: item.title,
  })), [hoveredItemId, items, selectedItemId]);

  return (
    <DiscoverMapCanvas
      center={center}
      markers={markers}
      onLoad={onLoad}
      onMarkerHover={onMarkerHover}
      onMarkerSelect={onMarkerSelect}
      onPreviewAction={onPreviewAction}
      previewItem={previewItem}
      onUnmount={onUnmount}
      zoom={zoom}
    />
  );
};

export const DiscoverMap = memo(DiscoverMapComponent);
