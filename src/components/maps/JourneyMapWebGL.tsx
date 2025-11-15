'use client';

import { useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import * as THREE from 'three';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  address?: string;
  day?: string;
}

interface JourneyMapWebGLProps {
  locations: Location[];
  center?: { lat: number; lng: number };
  onLocationClick?: (location: Location) => void;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  enableAnimation?: boolean;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 17.385,
  lng: 78.4867,
};

// Static libraries array to prevent LoadScript reloading
const GOOGLE_MAPS_LIBRARIES: 'places'[] = ['places'];

// Icon type to color/emoji mapping
const PLACE_TYPE_CONFIG = {
  stay: { color: 0x4ecdc4, emoji: '🏨', label: 'Hotel' },
  activity: { color: 0x45b7d1, emoji: '🎯', label: 'Activity' },
  food: { color: 0x96ceb4, emoji: '🍽️', label: 'Restaurant' },
  transport: { color: 0x6b66ff, emoji: '🚗', label: 'Transport' },
  note: { color: 0xff6b6b, emoji: '📝', label: 'Note' }
};

export default function JourneyMapWebGL({
  locations,
  center = defaultCenter,
  onLocationClick,
  enableAnimation = true,
}: JourneyMapWebGLProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const webglOverlayRef = useRef<google.maps.WebGLOverlayView | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const markersRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const animationStateRef = useRef({
    currentPointIndex: 0,
    animationProgress: 0,
    isAnimating: false,
  });

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Group locations by day
  const getPathsByDay = useCallback(() => {
    const pathsByDay: { [key: string]: Location[] } = {};

    locations.forEach(location => {
      const day = location.day || 'Day 1';
      if (!pathsByDay[day]) {
        pathsByDay[day] = [];
      }
      pathsByDay[day].push(location);
    });

    // Sort each day's locations by ID
    Object.keys(pathsByDay).forEach(day => {
      pathsByDay[day].sort((a, b) => {
        const indexA = parseInt(a.id.split('-')[1] || '0');
        const indexB = parseInt(b.id.split('-')[1] || '0');
        return indexA - indexB;
      });
    });

    return pathsByDay;
  }, [locations]);

  // Create 3D marker based on place type
  const createMarker = useCallback(
    (location: Location, altitude: number = 100) => {
      const group = new THREE.Group();

      const typeConfig =
        PLACE_TYPE_CONFIG[location.type as keyof typeof PLACE_TYPE_CONFIG] ||
        PLACE_TYPE_CONFIG.note;

      // Create pin geometry
      const pinGeometry = new THREE.ConeGeometry(5, 20, 8);
      const pinMaterial = new THREE.MeshPhongMaterial({
        color: typeConfig.color,
        emissive: typeConfig.color,
        emissiveIntensity: 0.2,
        shininess: 100,
      });
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      pin.rotation.x = Math.PI; // Point downward
      pin.position.y = altitude + 10;

      // Create icon sphere on top
      const sphereGeometry = new THREE.SphereGeometry(6, 16, 16);
      const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: typeConfig.color,
        emissiveIntensity: 0.3,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.y = altitude + 20;

      // Add pulsing animation data
      group.userData = {
        location,
        baseScale: 1,
        pulsePhase: Math.random() * Math.PI * 2,
        altitude,
      };

      group.add(pin);
      group.add(sphere);

      // Add glow ring for start location
      if (location.type === 'journeyLocation') {
        const ringGeometry = new THREE.RingGeometry(8, 10, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: typeConfig.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = altitude;
        group.add(ring);
      }

      return group;
    },
    []
  );

  // Create 3D polyline with proper curve
  const create3DPolyline = useCallback(
    (
      points: Location[],
      color: number = 0xff6b35,
      transformer: google.maps.CoordinateTransformer
    ) => {
      const group = new THREE.Group();

      if (points.length < 2) return group;

      // Create a smooth curve through all points
      const curvePoints: THREE.Vector3[] = [];

      points.forEach((point, index) => {
        const matrix = transformer.fromLatLngAltitude({
          lat: point.lat,
          lng: point.lng,
          altitude: 100 + Math.sin((index / points.length) * Math.PI) * 50, // Arc the path
        });

        const position = new THREE.Vector3();
        position.setFromMatrixPosition(new THREE.Matrix4().fromArray(matrix));
        curvePoints.push(position);
      });

      if (curvePoints.length >= 2) {
        // Create smooth curve
        const curve = new THREE.CatmullRomCurve3(
          curvePoints,
          false,
          'catmullrom',
          0.5
        );

        // Create tube along the curve
        const tubeGeometry = new THREE.TubeGeometry(curve, 64, 3, 8, false);
        const tubeMaterial = new THREE.MeshPhongMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.3,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
        });

        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        tube.userData = { isPolyline: true, points };
        group.add(tube);

        // Add animated particles along the path
        for (let i = 0; i < 5; i++) {
          const particleGeometry = new THREE.SphereGeometry(2.5, 8, 8);
          const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9,
          });
          const particle = new THREE.Mesh(particleGeometry, particleMaterial);
          particle.userData = {
            isParticle: true,
            progress: i / 5,
            curve: curve,
            speed: 0.005 + Math.random() * 0.005,
          };
          group.add(particle);
        }
      }

      return group;
    },
    []
  );

  // Initialize WebGL Overlay
  const initWebGLOverlay = useCallback(
    (map: google.maps.Map) => {
      if (!window.google?.maps?.WebGLOverlayView) {
        console.error('WebGLOverlayView not available');
        return;
      }

      const webglOverlayView = new google.maps.WebGLOverlayView();
      webglOverlayRef.current = webglOverlayView;

      webglOverlayView.onAdd = () => {
        // Set up the scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera();
        cameraRef.current = camera;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0.5, -1, 0.5);
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-0.5, 1, -0.5);
        scene.add(directionalLight2);
      };

      webglOverlayView.onContextRestored = ({ gl }) => {
        const renderer = new THREE.WebGLRenderer({
          canvas: gl.canvas,
          context: gl,
          ...gl.getContextAttributes(),
        });
        renderer.autoClear = false;
        rendererRef.current = renderer;

        // Create markers for all locations
        locations.forEach((location, index) => {
          const marker = createMarker(location, 100);
          sceneRef.current?.add(marker);
          markersRef.current.set(location.id, marker);
        });

        // Note: Polylines will be created in onDraw when transformer is available

        // Start animation if enabled
        if (enableAnimation && locations.length > 0) {
          animationStateRef.current.isAnimating = true;
          animationStateRef.current.currentPointIndex = 0;
        }

        // Animation loop
        renderer.setAnimationLoop(() => {
          webglOverlayView.requestRedraw();

          // Animate camera movement through journey points
          if (enableAnimation && animationStateRef.current.isAnimating && map) {
            const state = animationStateRef.current;

            if (state.currentPointIndex < locations.length) {
              state.animationProgress += 0.005; // Slow, smooth animation

              if (state.animationProgress >= 1) {
                state.currentPointIndex++;
                state.animationProgress = 0;

                // Stop when we reach the end
                if (state.currentPointIndex >= locations.length) {
                  state.isAnimating = false;
                }
              }

              // Smoothly move camera between points
              if (state.currentPointIndex < locations.length) {
                const currentLocation = locations[state.currentPointIndex];
                const nextLocation =
                  locations[
                    Math.min(state.currentPointIndex + 1, locations.length - 1)
                  ];

                const progress = state.animationProgress;
                const lat =
                  currentLocation.lat +
                  (nextLocation.lat - currentLocation.lat) * progress;
                const lng =
                  currentLocation.lng +
                  (nextLocation.lng - currentLocation.lng) * progress;

                // Smooth camera movement
                map.panTo({ lat, lng });

                // Adjust zoom and tilt for dramatic effect
                const currentZoom = map.getZoom() || 15;
                const targetZoom = 17;
                if (currentZoom < targetZoom) {
                  map.setZoom(currentZoom + 0.1);
                }

                const currentTilt = map.getTilt() || 0;
                const targetTilt = 45;
                if (currentTilt < targetTilt) {
                  map.setTilt(currentTilt + 0.5);
                }
              }
            }
          }

          // Animate markers (pulse effect)
          markersRef.current.forEach(marker => {
            const data = marker.userData;
            data.pulsePhase += 0.05;
            const scale = data.baseScale + Math.sin(data.pulsePhase) * 0.1;
            marker.scale.set(scale, scale, scale);
          });

          // Animate particles along polylines
          if (sceneRef.current) {
            sceneRef.current.children.forEach(child => {
              if (child instanceof THREE.Group) {
                child.children.forEach(mesh => {
                  if (mesh.userData.isParticle && mesh.userData.curve) {
                    mesh.userData.progress += mesh.userData.speed;
                    if (mesh.userData.progress > 1) mesh.userData.progress = 0;

                    const point = mesh.userData.curve.getPoint(
                      mesh.userData.progress
                    );
                    mesh.position.copy(point);
                  }
                });
              }
            });
          }
        });
      };

      webglOverlayView.onDraw = ({ gl, transformer }) => {
        if (!cameraRef.current || !rendererRef.current || !sceneRef.current)
          return;

        // Create polylines on first draw (when transformer is available)
        const hasPolylines = sceneRef.current.children.some(
          child =>
            child instanceof THREE.Group && child.userData.isPolylineGroup
        );

        if (!hasPolylines && locations.length >= 2) {
          const pathsByDay = getPathsByDay();
          const dayColors = [
            0xff6b35, 0x45b7d1, 0x4ecdc4, 0x96ceb4, 0xff6b6b, 0x6b66ff,
          ];

          Object.values(pathsByDay).forEach((dayLocations, dayIndex) => {
            if (dayLocations.length >= 2) {
              const color = dayColors[dayIndex % dayColors.length];
              const polylineGroup = create3DPolyline(
                dayLocations,
                color,
                transformer
              );
              polylineGroup.userData.isPolylineGroup = true;
              sceneRef.current?.add(polylineGroup);
            }
          });
        }

        // Position markers at their lat/lng locations
        markersRef.current.forEach((marker, locationId) => {
          const location = locations.find(loc => loc.id === locationId);
          if (location) {
            const altitude = marker.userData.altitude || 100;
            const matrix = transformer.fromLatLngAltitude({
              lat: location.lat,
              lng: location.lng,
              altitude: altitude,
            });
            marker.matrix = new THREE.Matrix4().fromArray(matrix);
            marker.matrixAutoUpdate = false;
          }
        });

        // Update camera matrix to sync with Google Maps camera
        const mapCenter = mapRef.current?.getCenter();
        if (mapCenter) {
          const cameraMatrix = transformer.fromLatLngAltitude({
            lat: mapCenter.lat(),
            lng: mapCenter.lng(),
            altitude: 1000, // Camera altitude
          });
          cameraRef.current.projectionMatrix = new THREE.Matrix4().fromArray(
            cameraMatrix
          );
        }

        // Render the scene
        webglOverlayView.requestRedraw();
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        rendererRef.current.resetState();
      };

      webglOverlayView.setMap(map);
    },
    [locations, enableAnimation, createMarker, create3DPolyline, getPathsByDay]
  );

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      if (locations && locations.length > 0) {
        try {
          const bounds = new window.google.maps.LatLngBounds();
          locations.forEach(location => {
            if (
              location &&
              typeof location.lat === 'number' &&
              typeof location.lng === 'number'
            ) {
              bounds.extend({ lat: location.lat, lng: location.lng });
            }
          });

          if (!bounds.isEmpty()) {
            map.fitBounds(bounds);
            const padding = { top: 50, right: 50, bottom: 50, left: 50 };
            map.fitBounds(bounds, padding);
          }
        } catch (error) {
          console.error('Error setting map bounds:', error);
        }
      }

      // Initialize WebGL overlay after map is loaded
      setTimeout(() => {
        initWebGLOverlay(map);
        setMapLoaded(true);
      }, 500);
    },
    [locations, initWebGLOverlay]
  );

  const onUnmount = useCallback(() => {
    if (webglOverlayRef.current) {
      webglOverlayRef.current.setMap(null);
    }
    markersRef.current.clear();
  }, []);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    console.log('Map clicked:', event);
    if (event.latLng) {
      onLocationClick?.({
        id: event.latLng.toString(),
        name: 'Journey Start',
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        type: 'journeyLocation',
      });
    }
  }, [onLocationClick]);

  if (loadError) {
    return (
      <motion.div
        className="h-full flex items-center justify-center bg-red-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Map Error</h3>
          <p className="text-red-600 text-sm mb-4">
            Google Maps failed to load. Please check your API key configuration.
          </p>
          <p className="text-xs text-red-500">
            {loadError.message || 'Invalid API key or insufficient permissions'}
          </p>
        </div>
      </motion.div>
    );
  }

  if (!isLoaded) {
    return (
      <motion.div
        className="h-full flex items-center justify-center bg-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.3,
              delay: 0.4,
              type: 'spring',
              stiffness: 200,
            }}
          ></motion.div>
          <motion.p
            className="text-gray-500"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            Loading 3D map...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          mapId: '15431d2b469f209e', // Required for WebGL features
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          gestureHandling: 'greedy',
          disableDefaultUI: true,
          clickableIcons: true,
          tilt: 40, // Enable 3D tilt
        }}
      />

      {/* Info overlay */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm"
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">
              {PLACE_TYPE_CONFIG[
                selectedLocation.type as keyof typeof PLACE_TYPE_CONFIG
              ]?.emoji || '📍'}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {selectedLocation.name}
              </h3>
              {selectedLocation.address && (
                <p className="text-sm text-gray-600 mt-1">
                  {selectedLocation.address}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {PLACE_TYPE_CONFIG[
                  selectedLocation.type as keyof typeof PLACE_TYPE_CONFIG
                ]?.label || selectedLocation.type}
              </p>
              {selectedLocation.day && (
                <p className="text-xs font-medium text-blue-600 mt-1">
                  {selectedLocation.day}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3"
      >
        <h4 className="text-xs font-semibold text-gray-700 mb-2">
          Place Types
        </h4>
        <div className="space-y-1">
          {Object.entries(PLACE_TYPE_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <span className="text-lg">{config.emoji}</span>
              <span className="text-gray-600">{config.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
