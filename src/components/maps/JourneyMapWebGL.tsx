'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
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
  startTime?: string;
  endTime?: string;
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
  onMapClick,
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
  const polylinesRef = useRef<Map<string, THREE.Group>>(new Map());
  const previousLocationsRef = useRef<Set<string>>(new Set());
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const markerAnimationStatesRef = useRef<Map<string, {
    state: 'adding' | 'updating' | 'removing' | 'stable';
    progress: number;
    startTime: number;
  }>>(new Map());
  const polylineAnimationStatesRef = useRef<Map<string, {
    progress: number;
    startTime: number;
  }>>(new Map());
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

  // Group locations by day and sort by time/order
  const getPathsByDay = useCallback(() => {
    const pathsByDay: { [key: string]: Location[] } = {};

    locations.forEach(location => {
      const day = location.day || 'Day 1';
      if (!pathsByDay[day]) {
        pathsByDay[day] = [];
      }
      pathsByDay[day].push(location);
    });

    // Sort each day's locations by:
    // 1. Start time if available
    // 2. Otherwise by array order (extract index from ID or use original order)
    Object.keys(pathsByDay).forEach(day => {
      pathsByDay[day].sort((a, b) => {
        // Try to sort by startTime if available (from journey-locations.utils)
        const aTime = (a as any).startTime;
        const bTime = (b as any).startTime;
        if (aTime && bTime) {
          return aTime.localeCompare(bTime);
        }
        
        // Fallback: sort by day number and index
        const dayNumA = parseInt(day.replace('Day ', '') || '1');
        const dayNumB = parseInt(day.replace('Day ', '') || '1');
        if (dayNumA !== dayNumB) {
          return dayNumA - dayNumB;
        }
        
        // Extract index from ID (format: journeyId-dayId-placeId or dayIndex-placeIndex)
        const indexA = parseInt(a.id.split('-').pop() || '0');
        const indexB = parseInt(b.id.split('-').pop() || '0');
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

      // Add pulsing animation data and animation state
      group.userData = {
        location,
        baseScale: 1,
        pulsePhase: Math.random() * Math.PI * 2,
        altitude,
        animationState: 'adding', // 'adding' | 'updating' | 'removing' | 'stable'
        animationProgress: 0,
        startTime: Date.now(),
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

  // Create 3D polyline with proper curve and animation support
  const create3DPolyline = useCallback(
    (
      points: Location[],
      color: number = 0xff6b35,
      transformer: google.maps.CoordinateTransformer,
      dayKey: string,
      animate: boolean = true
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

        // Store curve for animation
        group.userData = {
          isPolylineGroup: true,
          dayKey,
          curve,
          points,
          color,
          animationProgress: animate ? 0 : 1,
          startTime: animate ? Date.now() : 0,
          totalLength: curve.getLength(),
        };

        // Create tube along the curve with vibrant red color
        const tubeGeometry = new THREE.TubeGeometry(curve, 64, 5, 8, false); // Increased radius to 5 for visibility
        const tubeMaterial = new THREE.MeshPhongMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.5, // Increased for vibrant appearance
          transparent: true,
          opacity: animate ? 0 : 0.95, // Start invisible if animating, full opacity when done
          side: THREE.DoubleSide,
        });

        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        tube.userData = { isPolyline: true, points, curve };
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

          // Animate markers (pulse effect) - only for stable markers
          markersRef.current.forEach(marker => {
            const data = marker.userData;
            // Only pulse if marker is stable (not animating)
            if (data.animationState === 'stable') {
              data.pulsePhase += 0.05;
              const baseScale = data.baseScale || 1;
              const pulseScale = baseScale + Math.sin(data.pulsePhase) * 0.1;
              // Don't override scale if marker is being animated
              if (data.animationState === 'stable') {
                marker.scale.set(pulseScale, pulseScale, pulseScale);
              }
            }
          });

          // Animate polylines (draw animation with progressive reveal)
          polylinesRef.current.forEach((polyline, routeKey) => {
            const animState = polylineAnimationStatesRef.current.get(routeKey);
            if (animState && enableAnimation) {
              const elapsed = (Date.now() - animState.startTime) / 1000;
              const duration = 2.0; // 2 seconds to draw the line
              const progress = Math.min(elapsed / duration, 1);
              
              // Ease out cubic for smooth animation
              const easeOut = 1 - Math.pow(1 - progress, 3);
              animState.progress = easeOut;
              
              // Update polyline opacity and visibility with vibrant red
              polyline.children.forEach((child) => {
                if (child instanceof THREE.Mesh && child.userData.isPolyline && child.material instanceof THREE.MeshPhongMaterial) {
                  // Fade in the line with full vibrant opacity
                  child.material.opacity = 0.95 * easeOut;
                  
                  // Increase emissive intensity as it animates for vibrant effect
                  child.material.emissiveIntensity = 0.3 + (0.2 * easeOut);
                }
              });
              
              polyline.userData.animationProgress = easeOut;
            }
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

        // Create a single continuous route connecting all locations in order
        // Sort all locations by day and time to ensure correct order
        const sortedLocations = [...locations].sort((a, b) => {
          // First sort by day
          const dayA = parseInt((a.day || 'Day 1').replace('Day ', '') || '1');
          const dayB = parseInt((b.day || 'Day 1').replace('Day ', '') || '1');
          if (dayA !== dayB) {
            return dayA - dayB;
          }
          
          // Then sort by startTime if available
          if (a.startTime && b.startTime) {
            return a.startTime.localeCompare(b.startTime);
          }
          
          // Fallback: maintain array order
          return 0;
        });

        // Vibrant red color for the route: #FF2D2D
        const vibrantRedColor = 0xff2d2d;
        const routeKey = 'main-route';

        // Check if we need to recreate the route
        const existingRoute = polylinesRef.current.get(routeKey);
        const needsUpdate = !existingRoute || 
          existingRoute.userData.points?.length !== sortedLocations.length ||
          existingRoute.userData.points?.some((point: Location, index: number) => 
            point.id !== sortedLocations[index]?.id
          );

        if (needsUpdate && sortedLocations.length >= 2) {
          // Remove old route if it exists
          if (existingRoute) {
            sceneRef.current?.remove(existingRoute);
            polylinesRef.current.delete(routeKey);
            polylineAnimationStatesRef.current.delete(routeKey);
          }

          // Create new route with vibrant red color
          const routeGroup = create3DPolyline(
            sortedLocations,
            vibrantRedColor,
            transformer,
            routeKey,
            enableAnimation
          );
          polylinesRef.current.set(routeKey, routeGroup);
          sceneRef.current?.add(routeGroup);
          
          // Initialize animation state
          if (enableAnimation) {
            polylineAnimationStatesRef.current.set(routeKey, {
              progress: 0,
              startTime: Date.now(),
            });
          }
        } else if (sortedLocations.length < 2) {
          // Remove route if not enough points
          if (existingRoute) {
            sceneRef.current?.remove(existingRoute);
            polylinesRef.current.delete(routeKey);
            polylineAnimationStatesRef.current.delete(routeKey);
          }
        }

        // Update marker lifecycle and positions
        const currentLocationIds = new Set(locations.map(loc => loc.id));
        
        // Remove markers that no longer exist
        markersRef.current.forEach((marker, locationId) => {
          if (!currentLocationIds.has(locationId)) {
            // Mark for removal animation
            marker.userData.animationState = 'removing';
            marker.userData.animationProgress = 0;
            marker.userData.startTime = Date.now();
          }
        });

        // Add or update markers
        locations.forEach(location => {
          const existingMarker = markersRef.current.get(location.id);
          
          if (!existingMarker) {
            // New marker - create with drop animation
            const altitude = 100;
            const marker = createMarker(location, altitude);
            marker.userData.animationState = 'adding';
            marker.userData.animationProgress = 0;
            marker.userData.startTime = Date.now();
            markersRef.current.set(location.id, marker);
            sceneRef.current?.add(marker);
          } else {
            // Existing marker - check if location changed
            const oldLocation = existingMarker.userData.location;
            const locationChanged = 
              oldLocation.lat !== location.lat || 
              oldLocation.lng !== location.lng;
            
            if (locationChanged) {
              // Location updated - mark for update animation
              existingMarker.userData.oldLocation = { ...oldLocation };
              existingMarker.userData.animationState = 'updating';
              existingMarker.userData.animationProgress = 0;
              existingMarker.userData.startTime = Date.now();
            } else if (existingMarker.userData.animationState === 'adding' && 
                       existingMarker.userData.animationProgress >= 1) {
              // Animation complete, mark as stable
              existingMarker.userData.animationState = 'stable';
            }
            
            // Update location data
            existingMarker.userData.location = location;
          }
        });

        // Position and animate markers
        markersRef.current.forEach((marker, locationId) => {
          const location = locations.find(loc => loc.id === locationId);
          if (!location) {
            // Marker is being removed - animate out
            const animState = marker.userData.animationState;
            const animProgress = marker.userData.animationProgress;
            
            if (animState === 'removing') {
              const elapsed = (Date.now() - marker.userData.startTime) / 1000;
              const duration = 0.5; // 500ms
              const progress = Math.min(elapsed / duration, 1);
              marker.userData.animationProgress = progress;
              
              // Shrink and fade out
              const scale = 1 - progress * 0.6; // Shrink to 40%
              const opacity = 1 - progress;
              marker.scale.set(scale, scale, scale);
              marker.children.forEach((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
                  child.material.transparent = true;
                  child.material.opacity = opacity;
                }
              });
              
              if (progress >= 1) {
                // Remove from scene
                sceneRef.current?.remove(marker);
                markersRef.current.delete(locationId);
              }
            }
            return;
          }
          
          const altitude = marker.userData.altitude || 100;
          const animState = marker.userData.animationState;
          const elapsed = (Date.now() - marker.userData.startTime) / 1000;
          
          // Handle animation states
          if (animState === 'adding') {
            const duration = 0.6; // 600ms drop animation
            const progress = Math.min(elapsed / duration, 1);
            marker.userData.animationProgress = progress;
            
            // Drop animation: start from above, ease down
            const easeOut = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            const dropHeight = 200 * (1 - easeOut);
            const currentAltitude = altitude + dropHeight;
            
            const matrix = transformer.fromLatLngAltitude({
              lat: location.lat,
              lng: location.lng,
              altitude: currentAltitude,
            });
            marker.matrix = new THREE.Matrix4().fromArray(matrix);
            marker.matrixAutoUpdate = false;
            
            // Fade in
            const opacity = easeOut;
            marker.children.forEach((child) => {
              if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
                child.material.transparent = true;
                child.material.opacity = opacity;
              }
            });
            
            if (progress >= 1) {
              marker.userData.animationState = 'stable';
            }
          } else if (animState === 'updating') {
            const duration = 0.4; // 400ms update animation
            const progress = Math.min(elapsed / duration, 1);
            marker.userData.animationProgress = progress;
            
            if (progress < 0.5) {
              // Fade out old position
              const fadeOut = progress * 2;
              marker.children.forEach((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
                  child.material.transparent = true;
                  child.material.opacity = 1 - fadeOut;
                }
              });
            } else {
              // Fade in new position
              const fadeIn = (progress - 0.5) * 2;
              marker.children.forEach((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
                  child.material.transparent = true;
                  child.material.opacity = fadeIn;
                }
              });
            }
            
            // Interpolate position
            const oldLocation = marker.userData.oldLocation || location;
            const t = progress;
            const lat = oldLocation.lat + (location.lat - oldLocation.lat) * t;
            const lng = oldLocation.lng + (location.lng - oldLocation.lng) * t;
            
            const matrix = transformer.fromLatLngAltitude({
              lat,
              lng,
              altitude: altitude,
            });
            marker.matrix = new THREE.Matrix4().fromArray(matrix);
            marker.matrixAutoUpdate = false;
            
            if (progress >= 1) {
              marker.userData.animationState = 'stable';
              marker.userData.oldLocation = undefined;
            }
          } else {
            // Stable - normal position
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

      // Ensure Google Maps can always call onRemove safely and clean up resources
      webglOverlayView.onRemove = () => {
        try {
          if (rendererRef.current) {
            // Stop animation loop and dispose renderer
            rendererRef.current.setAnimationLoop(null);
            rendererRef.current.dispose();
            rendererRef.current = null;
          }

          // Clear Three.js scene graph references
          if (sceneRef.current) {
            sceneRef.current.clear();
          }
          sceneRef.current = null;
          cameraRef.current = null;

          // Clear any cached markers/polyline state
          markersRef.current.clear();
          polylinesRef.current.clear();
          polylineAnimationStatesRef.current.clear();
          markerAnimationStatesRef.current.clear();

          // Clear directions services/renderers
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
            directionsRendererRef.current = null;
          }
          directionsServiceRef.current = null;
        } catch (error) {
          console.error('Error during WebGL overlay removal:', error);
        }
      };

      webglOverlayView.setMap(map);
      
      // Initialize previous locations for change detection
      previousLocationsRef.current = new Set(locations.map(loc => loc.id));
      
      // Clear polylines on reinit
      polylinesRef.current.clear();
      polylineAnimationStatesRef.current.clear();
    },
    [locations, enableAnimation, createMarker, create3DPolyline, getPathsByDay]
  );

  // Extract and sort locations for route rendering
  const getSortedLocationsForRoute = useCallback(() => {
    if (!locations || locations.length === 0) return [];
    
    // Sort locations by day and time to ensure correct route order
    const sorted = [...locations].sort((a, b) => {
      // First sort by day
      const dayA = parseInt((a.day || 'Day 1').replace('Day ', '') || '1');
      const dayB = parseInt((b.day || 'Day 1').replace('Day ', '') || '1');
      if (dayA !== dayB) {
        return dayA - dayB;
      }
      
      // Then sort by startTime if available
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      
      // Fallback: maintain array order
      return 0;
    });

    // Extract lat/lng coordinates
    return sorted
      .filter(loc => 
        typeof loc.lat === 'number' && 
        typeof loc.lng === 'number' &&
        !isNaN(loc.lat) && 
        !isNaN(loc.lng)
      )
      .map(loc => ({ lat: loc.lat, lng: loc.lng }));
  }, [locations]);

  // Render Google Maps route using DirectionsService
  const renderRoute = useCallback((map: google.maps.Map) => {
    const routeLocations = getSortedLocationsForRoute();
    
    // Need at least 2 locations to draw a route
    if (routeLocations.length < 2) {
      // Clear existing route if locations are insufficient
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections({ routes: [] });
      }
      return;
    }

    // Initialize DirectionsService if not already done
    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new google.maps.DirectionsService();
    }

    // Initialize DirectionsRenderer if not already done
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // Keep existing markers
        map: map,
      });
    } else {
      directionsRendererRef.current.setMap(map);
    }

    // Prepare route request
    const origin = routeLocations[0];
    const destination = routeLocations[routeLocations.length - 1];
    const waypoints = routeLocations.slice(1, -1).map(loc => ({
      location: loc,
      stopover: true,
    }));

    // Request route
    directionsServiceRef.current.route(
      {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && directionsRendererRef.current) {
          directionsRendererRef.current.setDirections(result);
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  }, [getSortedLocationsForRoute]);

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
        
        // Render Google Maps route after map is fully loaded
        setTimeout(() => {
          renderRoute(map);
        }, 100);
      }, 500);
    },
    [locations, initWebGLOverlay, renderRoute]
  );

  const onUnmount = useCallback(() => {
    if (webglOverlayRef.current) {
      webglOverlayRef.current.setMap(null);
    }
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }
    markersRef.current.clear();
    polylinesRef.current.clear();
    polylineAnimationStatesRef.current.clear();
  }, []);

  // Update route when locations change
  useEffect(() => {
    if (mapLoaded && mapRef.current && isLoaded) {
      renderRoute(mapRef.current);
    }
  }, [locations, mapLoaded, isLoaded, renderRoute]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    console.log('Map clicked:', event);
    // Call onMapClick if provided (for adding new places)
    if (onMapClick) {
      onMapClick(event);
    } else if (event.latLng) {
      // Fallback: if onMapClick not provided, use onLocationClick for backward compatibility
      onLocationClick?.({
        id: event.latLng.toString(),
        name: 'Journey Start',
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        type: 'journeyLocation',
      });
    }
  }, [onMapClick, onLocationClick]);

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
      {/* <motion.div
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
      </motion.div> */}
    </div>
  );
}
