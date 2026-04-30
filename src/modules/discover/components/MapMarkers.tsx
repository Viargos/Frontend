'use client';

import type { MarkerClustererOptions } from '@googlemaps/markerclusterer';
import { memo, useMemo } from 'react';
import { GoogleMarkerClusterer, MarkerF } from '@/modules/discover/infra';

export type DiscoverMapPin = {
  id: string;
  isHovered?: boolean;
  isSelected: boolean;
  position: google.maps.LatLngLiteral;
  title: string;
};

type MapMarkersProps = {
  markers: DiscoverMapPin[];
  onMarkerHover?: (markerId: string | null) => void;
  onMarkerSelect?: (markerId: string) => void;
};

const CLUSTER_THRESHOLD = 30;

function getMarkerIcon(marker: DiscoverMapPin): google.maps.Symbol {
  if (marker.isSelected) {
    return {
      fillColor: '#160E53',
      fillOpacity: 1,
      path: google.maps.SymbolPath.CIRCLE,
      scale: 11,
      strokeColor: '#FFFFFF',
      strokeWeight: 3,
    };
  }

  if (marker.isHovered) {
    return {
      fillColor: '#0ea5b7',
      fillOpacity: 0.95,
      path: google.maps.SymbolPath.CIRCLE,
      scale: 9.5,
      strokeColor: '#FFFFFF',
      strokeWeight: 3,
    };
  }

  return {
    fillColor: '#ffffff',
    fillOpacity: 0.95,
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    strokeColor: '#160E53',
    strokeWeight: 2.5,
  };
}

const MapMarkersComponent = (props: MapMarkersProps) => {
  const { markers, onMarkerHover, onMarkerSelect } = props;
  const shouldCluster = markers.length > CLUSTER_THRESHOLD;
  const clusterOptions = useMemo<MarkerClustererOptions>(() => ({
    renderer: {
      render({ count, position }) {
        const scale = Math.min(34, 18 + Math.log2(count + 1) * 5);
        return new google.maps.Marker({
          icon: {
            fillColor: '#160E53',
            fillOpacity: 0.92,
            path: google.maps.SymbolPath.CIRCLE,
            scale,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
          label: {
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: '700',
            text: String(count),
          },
          position,
          zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
        });
      },
    },
  }), []);

  if (!shouldCluster) {
    return (
      <>
        {markers.map(marker => (
          <MarkerF
            key={marker.id}
            icon={getMarkerIcon(marker)}
            position={marker.position}
            title={marker.title}
            zIndex={marker.isSelected ? 1000 : marker.isHovered ? 900 : 1}
            onClick={() => onMarkerSelect?.(marker.id)}
            onMouseOut={() => onMarkerHover?.(null)}
            onMouseOver={() => onMarkerHover?.(marker.id)}
          />
        ))}
      </>
    );
  }

  return (
    <GoogleMarkerClusterer options={clusterOptions}>
      {clusterer => (
        <>
          {markers.map(marker => (
            <MarkerF
              key={marker.id}
              clusterer={clusterer}
              icon={getMarkerIcon(marker)}
              position={marker.position}
              title={marker.title}
              zIndex={marker.isSelected ? 1000 : marker.isHovered ? 900 : 1}
              onClick={() => onMarkerSelect?.(marker.id)}
              onMouseOut={() => onMarkerHover?.(null)}
              onMouseOver={() => onMarkerHover?.(marker.id)}
            />
          ))}
        </>
      )}
    </GoogleMarkerClusterer>
  );
};

export const MapMarkers = memo(MapMarkersComponent);
