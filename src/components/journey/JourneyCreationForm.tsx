"use client";

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  PlaceType, 
  CreateComprehensiveJourneyDto, 
  CreateJourneyDay, 
  CreateJourneyPlace 
} from '@/types/journey.types';
import { JourneyService } from '@/lib/services/journey.service';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import PlaceToStayIcon from '@/components/icons/PlaceToStayIcon';
import { TreesIcon } from '@/components/icons/TreesIcon';
import { FoodIcon } from '@/components/icons/FoodIcon';
import { TransportIcon } from '@/components/icons/TransportIcon';
import { NotesIcon } from '@/components/icons/NotesIcon';
import { CalendarIcon } from '@/components/icons/CalendarIcon';

interface JourneyCreationFormProps {
  onSuccess?: (journeyId: string) => void;
  onCancel?: () => void;
}

const PlaceTypeIcons: Record<PlaceType, React.ReactNode> = {
  [PlaceType.STAY]: <PlaceToStayIcon />,
  [PlaceType.ACTIVITY]: <TreesIcon className="w-5 h-5" />,
  [PlaceType.FOOD]: <FoodIcon className="w-5 h-5" />,
  [PlaceType.TRANSPORT]: <TransportIcon className="w-5 h-5" />,
  [PlaceType.NOTE]: <NotesIcon className="w-5 h-5" />,
};

const PlaceTypeLabels: Record<PlaceType, string> = {
  [PlaceType.STAY]: 'Place to Stay',
  [PlaceType.ACTIVITY]: 'Activity',
  [PlaceType.FOOD]: 'Food',
  [PlaceType.TRANSPORT]: 'Transport',
  [PlaceType.NOTE]: 'Note',
};

export default function JourneyCreationForm({ onSuccess, onCancel }: JourneyCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateComprehensiveJourneyDto>({
    title: '',
    description: '',
    days: [
      {
        dayNumber: 1,
        date: new Date().toISOString().split('T')[0],
        notes: '',
        places: []
      }
    ]
  });

  const journeyService = new JourneyService();

  const handleTitleChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, title: value }));
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  }, []);

  const addDay = useCallback(() => {
    const newDayNumber = formData.days.length + 1;
    const lastDate = formData.days[formData.days.length - 1]?.date;
    const nextDate = lastDate 
      ? new Date(new Date(lastDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    setFormData(prev => ({
      ...prev,
      days: [
        ...prev.days,
        {
          dayNumber: newDayNumber,
          date: nextDate,
          notes: '',
          places: []
        }
      ]
    }));
  }, [formData.days]);

  const removeDay = useCallback((dayIndex: number) => {
    if (formData.days.length === 1) return; // Don't remove the last day
    
    setFormData(prev => ({
      ...prev,
      days: prev.days.filter((_, index) => index !== dayIndex).map((day, index) => ({
        ...day,
        dayNumber: index + 1
      }))
    }));
  }, [formData.days.length]);

  const updateDay = useCallback((dayIndex: number, field: keyof CreateJourneyDay, value: any) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, index) => 
        index === dayIndex ? { ...day, [field]: value } : day
      )
    }));
  }, []);

  const addPlace = useCallback((dayIndex: number) => {
    const newPlace: CreateJourneyPlace = {
      type: PlaceType.ACTIVITY,
      name: '',
      description: '',
      startTime: '',
      endTime: ''
    };

    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, index) =>
        index === dayIndex ? { ...day, places: [...day.places, newPlace] } : day
      )
    }));
  }, []);

  const removePlace = useCallback((dayIndex: number, placeIndex: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, index) =>
        index === dayIndex 
          ? { ...day, places: day.places.filter((_, pIndex) => pIndex !== placeIndex) }
          : day
      )
    }));
  }, []);

  const updatePlace = useCallback((dayIndex: number, placeIndex: number, field: keyof CreateJourneyPlace, value: any) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              places: day.places.map((place, pIndex) =>
                pIndex === placeIndex ? { ...place, [field]: value } : place
              )
            }
          : day
      )
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!formData.title.trim()) {
      setError('Journey title is required');
      return;
    }

    if (formData.days.length === 0) {
      setError('At least one day is required');
      return;
    }

    // Validate each day
    for (let i = 0; i < formData.days.length; i++) {
      const day = formData.days[i];
      if (!day.date) {
        setError(`Day ${i + 1} must have a date`);
        return;
      }
      
      // Validate places
      for (let j = 0; j < day.places.length; j++) {
        const place = day.places[j];
        if (!place.name.trim()) {
          setError(`Day ${i + 1}, Place ${j + 1} must have a name`);
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      const journey = await journeyService.createComprehensiveJourney(formData);
      onSuccess?.(journey.id);
    } catch (error: any) {
      setError(error.message || 'Failed to create journey');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Journey</h1>
          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Journey'}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
          
          <InputField
            label="Journey Title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Enter your journey title..."
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Describe your journey..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Days */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Journey Days</h2>
            <Button type="button" variant="secondary" onClick={addDay}>
              Add Day
            </Button>
          </div>

          {formData.days.map((day, dayIndex) => (
            <motion.div
              key={dayIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg border border-gray-200 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Day {day.dayNumber}</h3>
                {formData.days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDay(dayIndex)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove Day
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="inline w-4 h-4 mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={day.date}
                    onChange={(e) => updateDay(dayIndex, 'date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={day.notes || ''}
                    onChange={(e) => updateDay(dayIndex, 'notes', e.target.value)}
                    placeholder="Day notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Places */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium text-gray-800">Places & Activities</h4>
                  <button
                    type="button"
                    onClick={() => addPlace(dayIndex)}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
                  >
                    Add Place
                  </button>
                </div>

                {day.places.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No places added yet. Click "Add Place" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {day.places.map((place, placeIndex) => (
                      <motion.div
                        key={placeIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-300">
                              {PlaceTypeIcons[place.type]}
                            </div>
                            <span className="font-medium text-gray-900">
                              {PlaceTypeLabels[place.type]}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePlace(dayIndex, placeIndex)}
                            className="text-red-500 hover:text-red-700 text-sm transition-colors"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type
                            </label>
                            <select
                              value={place.type}
                              onChange={(e) => updatePlace(dayIndex, placeIndex, 'type', e.target.value as PlaceType)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {Object.values(PlaceType).map(type => (
                                <option key={type} value={type}>
                                  {PlaceTypeLabels[type]}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={place.name}
                              onChange={(e) => updatePlace(dayIndex, placeIndex, 'name', e.target.value)}
                              placeholder="Enter place name..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>

                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={place.description || ''}
                              onChange={(e) => updatePlace(dayIndex, placeIndex, 'description', e.target.value)}
                              placeholder="Enter description..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={place.startTime || ''}
                              onChange={(e) => updatePlace(dayIndex, placeIndex, 'startTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={place.endTime || ''}
                              onChange={(e) => updatePlace(dayIndex, placeIndex, 'endTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </form>
    </div>
  );
}
