'use client';

import { useState } from 'react';
import { JourneyMapToggle } from '@/components/maps';

/**
 * Demo page for WebGL 3D Journey Map
 * This demonstrates all features of the 3D map implementation
 */
export default function Journey3DDemo() {
  // Sample journey data with various place types
  const sampleLocations = [
    {
      id: 'Day 1-0',
      name: 'Paris Grand Hotel',
      lat: 48.8566,
      lng: 2.3522,
      type: 'stay',
      day: 'Day 1',
      address: '123 Rue de la Paix, Paris, France',
    },
    {
      id: 'Day 1-1',
      name: 'Louvre Museum',
      lat: 48.8606,
      lng: 2.3376,
      type: 'activity',
      day: 'Day 1',
      address: 'Rue de Rivoli, 75001 Paris, France',
    },
    {
      id: 'Day 1-2',
      name: 'Le Meurice',
      lat: 48.8655,
      lng: 2.3283,
      type: 'food',
      day: 'Day 1',
      address: '228 Rue de Rivoli, 75001 Paris, France',
    },
    {
      id: 'Day 1-3',
      name: 'Eiffel Tower',
      lat: 48.8584,
      lng: 2.2945,
      type: 'activity',
      day: 'Day 1',
      address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
    },
    {
      id: 'Day 2-0',
      name: 'Arc de Triomphe',
      lat: 48.8738,
      lng: 2.295,
      type: 'activity',
      day: 'Day 2',
      address: 'Place Charles de Gaulle, 75008 Paris, France',
    },
    {
      id: 'Day 2-1',
      name: 'Champs-Élysées',
      lat: 48.8698,
      lng: 2.3078,
      type: 'activity',
      day: 'Day 2',
      address: 'Avenue des Champs-Élysées, 75008 Paris, France',
    },
    {
      id: 'Day 2-2',
      name: 'Le Jules Verne',
      lat: 48.8583,
      lng: 2.2945,
      type: 'food',
      day: 'Day 2',
      address: 'Eiffel Tower, Avenue Gustave Eiffel, 75007 Paris, France',
    },
    {
      id: 'Day 3-0',
      name: 'Notre-Dame Cathedral',
      lat: 48.853,
      lng: 2.3499,
      type: 'activity',
      day: 'Day 3',
      address: '6 Parvis Notre-Dame, 75004 Paris, France',
    },
    {
      id: 'Day 3-1',
      name: 'Sainte-Chapelle',
      lat: 48.8554,
      lng: 2.345,
      type: 'activity',
      day: 'Day 3',
      address: '8 Boulevard du Palais, 75001 Paris, France',
    },
    {
      id: 'Day 3-2',
      name: 'Taxi to Airport',
      lat: 49.0097,
      lng: 2.5479,
      type: 'transport',
      day: 'Day 3',
      address: 'Charles de Gaulle Airport, 95700 Roissy-en-France',
    },
  ];

  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const handleLocationClick = (location: any) => {
    setSelectedLocation(location);
    console.log('Location clicked:', location);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">
          3D WebGL Journey Map Demo
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Experience your journey with immersive 3D visualization powered by
          WebGL and Three.js
        </p>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <JourneyMapToggle
          locations={sampleLocations}
          defaultMode="3d"
          onLocationClick={handleLocationClick}
        />
      </div>

      {/* Info Panel - Shows when location is clicked */}
      {selectedLocation && (
        <div className="absolute bottom-6 left-6 right-6 md:right-auto md:max-w-md bg-white rounded-lg shadow-2xl p-6 z-20 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {selectedLocation.name}
              </h3>
              <p className="text-sm text-blue-600 font-medium mt-1">
                {selectedLocation.day}
              </p>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {selectedLocation.address && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {selectedLocation.address}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium capitalize">
              {selectedLocation.type}
            </span>
            <span className="text-gray-500">
              {selectedLocation.lat.toFixed(4)}°,{' '}
              {selectedLocation.lng.toFixed(4)}°
            </span>
          </div>
        </div>
      )}

      {/* Feature Info Cards */}
      <div className="absolute top-20 right-6 w-64 space-y-3 z-10 hidden xl:block">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900">3D Markers</h4>
          </div>
          <p className="text-xs text-gray-600">
            Custom 3D pin geometry with pulsing animations
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900">Animated Routes</h4>
          </div>
          <p className="text-xs text-gray-600">
            Smooth 3D tubes with flowing particles
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900">Camera Animation</h4>
          </div>
          <p className="text-xs text-gray-600">
            Automatic flythrough of your journey path
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-t border-blue-100 px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-blue-900">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            <strong>Tip:</strong> Use the toggle buttons in the top-left to
            switch between 2D/3D views and control animations
          </span>
        </div>
      </div>
    </div>
  );
}
