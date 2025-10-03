'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export default function RadiusSlider({
  value,
  onChange,
  min = 1,
  max = 500,
  step = 1,
  disabled = false,
  className = '',
}: RadiusSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    onChange(newValue);
  };

  const getRadiusLabel = (radius: number) => {
    if (radius < 1) return '0.1 km';
    if (radius < 10) return `${radius} km`;
    if (radius < 100) return `${radius} km`;
    return `${radius} km`;
  };

  const getRadiusColor = (radius: number) => {
    if (radius <= 10) return 'text-green-600';
    if (radius <= 50) return 'text-yellow-600';
    if (radius <= 100) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRadiusBgColor = (radius: number) => {
    if (radius <= 10) return 'bg-green-100';
    if (radius <= 50) return 'bg-yellow-100';
    if (radius <= 100) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">
          Search Radius
        </label>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={`px-3 py-1 rounded-full text-sm font-semibold ${getRadiusBgColor(
            value
          )} ${getRadiusColor(value)}`}
        >
          {getRadiusLabel(value)}
        </motion.div>
      </div>

      <div className="relative py-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
              ((value - min) / (max - min)) * 100
            }%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{getRadiusLabel(min)}</span>
        <span>{getRadiusLabel(max)}</span>
      </div>

      {/* Radius indicators - Optional preset buttons */}
      <div className="flex justify-between mt-3">
        {[
          { value: 5, label: 'Local' },
          { value: 25, label: 'City' },
          { value: 100, label: 'Region' },
          { value: 500, label: 'Country' },
        ].map(indicator => (
          <button
            key={indicator.value}
            onClick={() => onChange(indicator.value)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              Math.abs(value - indicator.value) <= 5
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {indicator.label}
          </button>
        ))}
      </div>

      <style jsx>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
          height: 12px;
          border-radius: 6px;
          outline: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 2px solid white;
          transition: all 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          background: #2563eb;
          transform: scale(1.1);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .slider::-moz-range-thumb:hover {
          background: #2563eb;
          transform: scale(1.1);
        }

        .slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .slider:disabled::-webkit-slider-thumb {
          cursor: not-allowed;
        }

        .slider:disabled::-moz-range-thumb {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
