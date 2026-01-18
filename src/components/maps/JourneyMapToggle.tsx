'use client';

import { useState } from 'react';
import JourneyMap from './JourneyMap';
import JourneyMapWebGL from './JourneyMapWebGL';
import { Box3DIcon, JourneyIcon, PlayIcon, PauseIcon } from '@/components/icons';

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
              ? 'bg-[#001A6E] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={mode === '2d' ? 'Switch to 3D View' : 'Switch to 2D View'}
        >
          {mode === '2d' ? (
            <span className="flex items-center gap-2">
              <Box3DIcon className="w-4 h-4" />
              3D View
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <JourneyIcon className="w-4 h-4" />
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
                <PlayIcon className="w-4 h-4" />
                Animating
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <PauseIcon className="w-4 h-4" />
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
