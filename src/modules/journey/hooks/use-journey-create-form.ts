'use client';

import type { JourneyCreateInput, JourneyDayInput, JourneyPlaceInput } from '@/modules/journey/types/journey.types';
import { useState } from 'react';
import { PlaceType } from '@/modules/journey/enums/place-type.enum';
import { createClientId, todayIsoDate } from '@/modules/journey/helpers/journey.helper';
import { journeyCreateSchema } from '@/modules/journey/validations/journey.validation';

function createPlace(type: PlaceType = PlaceType.ACTIVITY): JourneyPlaceInput {
  return {
    address: '',
    description: '',
    endTime: '',
    id: createClientId('place'),
    latitude: undefined,
    longitude: undefined,
    name: '',
    startTime: '',
    type,
  };
}

function createDay(dayNumber: number): JourneyDayInput {
  return {
    date: todayIsoDate(),
    dayNumber,
    id: createClientId('day'),
    places: [],
  };
}

const INITIAL_STATE: JourneyCreateInput = {
  days: [createDay(1)],
  description: '',
  title: '',
};

type EditablePlaceField = 'address' | 'description' | 'endTime' | 'latitude' | 'longitude' | 'name' | 'startTime' | 'type';

export function useJourneyCreateForm() {
  const [values, setValues] = useState<JourneyCreateInput>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);

  const setTitle = (title: string) => {
    setValues(prev => ({ ...prev, title }));
  };

  const setDescription = (description: string) => {
    setValues(prev => ({ ...prev, description }));
  };

  const addDay = (): string => {
    const nextDay = createDay(values.days.length + 1);
    setValues(prev => ({
      ...prev,
      days: [...prev.days, nextDay],
    }));
    return nextDay.id;
  };

  const removeDay = (dayId: string) => {
    setValues((prev) => {
      const remaining = prev.days.filter(day => day.id !== dayId);
      if (remaining.length === 0) {
        return prev;
      }

      return {
        ...prev,
        days: remaining.map((day, index) => ({
          ...day,
          dayNumber: index + 1,
        })),
      };
    });
  };

  const updateDay = (dayId: string, field: 'date' | 'notes', value: string) => {
    setValues(prev => ({
      ...prev,
      days: prev.days.map(day => (day.id === dayId ? { ...day, [field]: value } : day)),
    }));
  };

  const addPlace = (dayId: string, type: PlaceType = PlaceType.ACTIVITY): string => {
    const createdPlaceId = createClientId('place');

    setValues(prev => ({
      ...prev,
      days: prev.days.map((day) => {
        if (day.id !== dayId) {
          return day;
        }

        return {
          ...day,
          places: [
            ...day.places,
            {
              ...createPlace(type),
              id: createdPlaceId,
            },
          ],
        };
      }),
    }));

    return createdPlaceId;
  };

  const removePlace = (dayId: string, placeId: string) => {
    setValues(prev => ({
      ...prev,
      days: prev.days.map((day) => {
        if (day.id !== dayId) {
          return day;
        }

        return {
          ...day,
          places: day.places.filter(place => place.id !== placeId),
        };
      }),
    }));
  };

  const updatePlace = (
    dayId: string,
    placeId: string,
    field: EditablePlaceField,
    value: string | number,
  ) => {
    setValues(prev => ({
      ...prev,
      days: prev.days.map((day) => {
        if (day.id !== dayId) {
          return day;
        }

        return {
          ...day,
          places: day.places.map((place) => {
            if (place.id !== placeId) {
              return place;
            }

            if (field === 'type') {
              return {
                ...place,
                type: value as PlaceType,
              };
            }

            return {
              ...place,
              [field]: value,
            };
          }),
        };
      }),
    }));
  };

  const reorderPlaces = (dayId: string, oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) {
      return;
    }

    setValues((prev) => {
      return {
        ...prev,
        days: prev.days.map((day) => {
          if (day.id !== dayId) {
            return day;
          }

          if (oldIndex < 0 || newIndex < 0 || oldIndex >= day.places.length || newIndex >= day.places.length) {
            return day;
          }

          const nextPlaces = [...day.places];
          const [moved] = nextPlaces.splice(oldIndex, 1);
          if (!moved) {
            return day;
          }
          nextPlaces.splice(newIndex, 0, moved);

          return {
            ...day,
            places: nextPlaces,
          };
        }),
      };
    });
  };

  const validate = (): boolean => {
    const parsed = journeyCreateSchema.safeParse(values);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      setError(firstIssue?.message ?? 'Invalid journey data');
      return false;
    }

    setError(null);
    return true;
  };

  return {
    addDay,
    addPlace,
    error,
    removeDay,
    removePlace,
    reorderPlaces,
    setDescription,
    setError,
    setTitle,
    updateDay,
    updatePlace,
    validate,
    values,
  };
}
