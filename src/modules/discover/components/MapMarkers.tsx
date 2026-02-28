'use client';

import type { MarkerClustererOptions } from '@googlemaps/markerclusterer';
import { memo, useMemo } from 'react';
import { GoogleMarkerClusterer, MarkerF } from '@/modules/discover/infra';

export type DiscoverMapPin = {
  id: string;
  isSelected: boolean;
  position: google.maps.LatLngLiteral;
  title: string;
};

type MapMarkersProps = {
  markers: DiscoverMapPin[];
};

const CLUSTER_THRESHOLD = 30;

const MapMarkersComponent = (props: MapMarkersProps) => {
  const { markers } = props;
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
          <MarkerF key={marker.id} position={marker.position} title={marker.title} zIndex={marker.isSelected ? 1000 : 1} />
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
              position={marker.position}
              title={marker.title}
              zIndex={marker.isSelected ? 1000 : 1}
            />
          ))}
        </>
      )}
    </GoogleMarkerClusterer>
  );
};

export const MapMarkers = memo(MapMarkersComponent);
