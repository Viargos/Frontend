import React, { useEffect, useRef, useState } from 'react';
import { CreateJourneyPlace, PlaceType } from '@/types/journey.types';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { PlacePhotoSection } from './PlacePhotoSection';
import { geocodeAddress } from '@/utils/geocoding.utils';
import { validateTimeRange } from '@/utils/time.utils';

interface PlaceFormProps {
  place: CreateJourneyPlace;
  dayKey: string;
  index: number;
  onUpdateField: (field: keyof CreateJourneyPlace, value: string | number) => void;
  onAddPhoto?: (photoKey: string) => void;
  onRemovePhoto?: (photoIndex: number) => void;
}

export const PlaceForm: React.FC<PlaceFormProps> = ({
  place,
  dayKey,
  index,
  onUpdateField,
  onAddPhoto,
  onRemovePhoto
}) => {
  const {
    placeSuggestions,
    showSuggestions,
    handleAutocompletePredictions,
    handlePlaceSelect,
    hideSuggestions
  } = useGooglePlaces();

  const fieldKey = `${dayKey}-${index}`;
  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const lastGeocodedAddressRef = useRef<string>('');

  const handleAddressChange = (value: string) => {
    onUpdateField('address', value);
    handleAutocompletePredictions(value, fieldKey);
    
    // Clear existing geocode timeout
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    // If address changed and doesn't have coordinates, geocode after user stops typing
    if (value && value.trim() && value !== lastGeocodedAddressRef.current) {
      geocodeTimeoutRef.current = setTimeout(async () => {
        // Only geocode if no coordinates exist or address changed
        if (!place.latitude || !place.longitude || place.address !== value) {
          setIsGeocoding(true);
          const result = await geocodeAddress(value);
          if (result) {
            onUpdateField('latitude', result.lat);
            onUpdateField('longitude', result.lng);
            // Update address with formatted address if different
            if (result.address !== value) {
              onUpdateField('address', result.address);
            }
            // Update name if empty or if geocoding found a better name
            if (!place.name || place.name === 'New Place' || place.name.startsWith('New ')) {
              onUpdateField('name', result.name || result.address.split(',')[0]);
            }
            lastGeocodedAddressRef.current = result.address;
          }
          setIsGeocoding(false);
        }
      }, 1000); // Wait 1 second after user stops typing
    }
  };

  const onPlaceSelected = (placeId: string, description: string) => {
    handlePlaceSelect(placeId, description, (lat, lng, address, name) => {
      onUpdateField('name', name);
      onUpdateField('latitude', lat);
      onUpdateField('longitude', lng);
      onUpdateField('address', address);
      lastGeocodedAddressRef.current = address;
    });
  };

  // Geocode on blur if address exists but no coordinates
  const handleAddressBlur = async () => {
    hideSuggestions(fieldKey);
    
    const address = place.address?.trim();
    if (address && (!place.latitude || !place.longitude)) {
      setIsGeocoding(true);
      const result = await geocodeAddress(address);
      if (result) {
        onUpdateField('latitude', result.lat);
        onUpdateField('longitude', result.lng);
        if (result.address !== address) {
          onUpdateField('address', result.address);
        }
        if (!place.name || place.name === 'New Place' || place.name.startsWith('New ')) {
          onUpdateField('name', result.name || result.address.split(',')[0]);
        }
        lastGeocodedAddressRef.current = result.address;
      }
      setIsGeocoding(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
    };
  }, []);

  if (place.type === PlaceType.NOTE) {
    return (
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Notes
        </label>
        <textarea
          value={place.description || ''}
          onChange={(e) => onUpdateField('description', e.target.value)}
          placeholder="Add your notes here..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none"
        />
      </div>
    );
  }

  return (
    <>
      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Name *
        </label>
        <input
          type="text"
          value={place.name}
          onChange={(e) => onUpdateField('name', e.target.value)}
          placeholder="Enter place name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
        />
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Description
        </label>
        <textarea
          value={place.description || ''}
          onChange={(e) => onUpdateField('description', e.target.value)}
          placeholder="Enter description"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none"
        />
      </div>

      {/* Time Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Start Time
          </label>
          <input
            type="time"
            value={place.startTime || ''}
            onChange={(e) => {
              const timeValue = e.target.value;
              onUpdateField('startTime', timeValue);
            }}
            className={`w-full px-3 py-2 border rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent ${
              place.startTime && place.endTime && !validateTimeRange(place.startTime, place.endTime)
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            step="60"
          />
          {place.startTime && place.endTime && !validateTimeRange(place.startTime, place.endTime) && (
            <p className="text-xs text-red-600 mt-1">
              Start time must be before end time
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            End Time
          </label>
          <input
            type="time"
            value={place.endTime || ''}
            onChange={(e) => {
              const timeValue = e.target.value;
              onUpdateField('endTime', timeValue);
            }}
            className={`w-full px-3 py-2 border rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent ${
              place.startTime && place.endTime && !validateTimeRange(place.startTime, place.endTime)
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            step="60"
          />
          {place.startTime && place.endTime && !validateTimeRange(place.startTime, place.endTime) && (
            <p className="text-xs text-red-600 mt-1">
              End time must be after start time
            </p>
          )}
        </div>
      </div>

      {/* Location/Address Field with Autocomplete */}
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Location/Address *
        </label>
        <div className="relative">
          <input
            type="text"
            value={place.address || ''}
            onChange={(e) => handleAddressChange(e.target.value)}
            onBlur={handleAddressBlur}
            placeholder="Search for a location (e.g., Eiffel Tower, Paris)"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            autoComplete="off"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions[fieldKey] && placeSuggestions[fieldKey]?.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {placeSuggestions[fieldKey].map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur
                    onPlaceSelected(suggestion.place_id, suggestion.description);
                  }}
                >
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-black font-medium truncate">
                        {suggestion.structured_formatting.main_text}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {suggestion.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Start typing to see location suggestions
        </p>
        {isGeocoding && (
          <p className="text-xs text-blue-600 mt-1">
            🔍 Finding location...
          </p>
        )}
        {place.latitude && place.longitude && !isGeocoding && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Location found: {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
          </p>
        )}
      </div>

      {/* Photo Section */}
      {onAddPhoto && onRemovePhoto && (
        <PlacePhotoSection
          photos={place.photos || []}
          placeId={`${dayKey}-${index}`}
          onAddPhoto={onAddPhoto}
          onRemovePhoto={onRemovePhoto}
        />
      )}
    </>
  );
};
