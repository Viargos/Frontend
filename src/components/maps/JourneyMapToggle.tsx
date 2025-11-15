'use client';

import { useState } from 'react';
import JourneyMap from './JourneyMap';
import JourneyMapWebGL from './JourneyMapWebGL';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  address?: string;
  day?: string;
}

interface JourneyMapToggleProps {
  locations: Location[];
  center?: { lat: number; lng: number };
  onLocationClick?: (location: Location) => void;
  defaultMode?: '2d' | '3d';
}

export default function JourneyMapToggle({
  locations,
  center,
  onLocationClick,
  defaultMode = '2d',
}: JourneyMapToggleProps) {
  const [mode, setMode] = useState<'2d' | '3d'>(defaultMode);
  const [enableAnimation, setEnableAnimation] = useState(true);

  return (
    <div className="relative w-full h-full">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2 flex gap-2">
        {/* 2D/3D Toggle */}
        <button
          onClick={() => setMode(mode === '2d' ? '3d' : '2d')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            mode === '3d'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={mode === '2d' ? 'Switch to 3D View' : 'Switch to 2D View'}
        >
          {mode === '2d' ? (
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
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
              3D View
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              2D View
            </span>
          )}
        </button>

        {/* Animation Toggle (only visible in 3D mode) */}
        {mode === '3d' && (
          <button
            onClick={() => setEnableAnimation(!enableAnimation)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              enableAnimation
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={enableAnimation ? 'Disable Animation' : 'Enable Animation'}
          >
            {enableAnimation ? (
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Animating
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Paused
              </span>
            )}
          </button>
        )}
      </div>

      {/* Mode Badge */}
      <div className="absolute top-4 right-4 z-10 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm">
        {mode === '3d' ? '3D WebGL Mode' : '2D Standard Mode'}
      </div>

      {/* Render Map */}
      {mode === '3d' ? (
        <JourneyMapWebGL
          locations={locations}
          center={center}
          onLocationClick={onLocationClick}
          enableAnimation={enableAnimation}
        />
      ) : (
        <JourneyMap
          locations={locations}
          center={center}
          onLocationClick={onLocationClick}
        />
      )}
    </div>
  );
}
