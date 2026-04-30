'use client';

import type { PlaceType } from '@/modules/journey/enums/place-type.enum';
import type { JourneyDetail } from '@/modules/journey/types/journey-detail.types';
import type { JourneyCreateInput, JourneyDayInput, JourneyPlaceInput, JourneyPlaceMediaInput } from '@/modules/journey/types/journey.types';
import { useMemo, useState } from 'react';
import { createClientId, todayIsoDate } from '@/modules/journey/helpers/journey.helper';
import { journeyCreateSchema } from '@/modules/journey/validations/journey.validation';

type PlannerState = JourneyCreateInput & {
  endDate: string;
  startDate: string;
};

type EditablePlaceField
  = | 'address'
    | 'bookingEndDayNumber'
    | 'bookingStartDayNumber'
    | 'description'
    | 'endTime'
    | 'latitude'
    | 'longitude'
    | 'name'
    | 'order'
    | 'startTime'
    | 'type';

const DAY_MS = 24 * 60 * 60 * 1000;

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createMediaInput(partial?: Partial<JourneyPlaceMediaInput>): JourneyPlaceMediaInput {
  return {
    file: partial?.file,
    id: partial?.id ?? createClientId('media'),
    order: partial?.order,
    previewUrl: partial?.previewUrl ?? partial?.url ?? '',
    thumbnailUrl: partial?.thumbnailUrl,
    type: partial?.type ?? 'image',
    url: partial?.url,
  };
}

function cloneMediaItems(media: JourneyPlaceMediaInput[]): JourneyPlaceMediaInput[] {
  return media.map(item => createMediaInput(item));
}

function createPlace(type: PlaceType, dayNumber: number): JourneyPlaceInput {
  return {
    address: '',
    bookingEndDayNumber: dayNumber,
    bookingGroupId: createClientId('booking'),
    bookingStartDayNumber: dayNumber,
    description: '',
    endTime: '',
    id: createClientId('place'),
    latitude: undefined,
    longitude: undefined,
    media: [],
    name: '',
    order: 0,
    startTime: '',
    type,
  };
}

function createDay(dayNumber: number, date: string): JourneyDayInput {
  return {
    date,
    dayNumber,
    id: createClientId('day'),
    notes: '',
    places: [],
  };
}

function normalizeDateRange(startDate: string, endDate: string): { endDate: string; startDate: string } {
  if (!startDate && !endDate) {
    const today = todayIsoDate();
    return { endDate: today, startDate: today };
  }

  if (!startDate) {
    return { endDate, startDate: endDate };
  }

  if (!endDate) {
    return { endDate: startDate, startDate };
  }

  return startDate <= endDate
    ? { endDate, startDate }
    : { endDate: startDate, startDate: endDate };
}

function generateDays(startDate: string, endDate: string, existingDays?: JourneyDayInput[]): JourneyDayInput[] {
  const normalizedRange = normalizeDateRange(startDate, endDate);
  const start = new Date(normalizedRange.startDate);
  const finish = new Date(normalizedRange.endDate);
  const existingByDate = new Map((existingDays ?? []).map(day => [day.date, day]));
  const nextDays: JourneyDayInput[] = [];

  for (let cursor = new Date(start), index = 1; cursor <= finish; cursor = new Date(cursor.getTime() + DAY_MS), index += 1) {
    const isoDate = toIsoDate(cursor);
    const existingDay = existingByDate.get(isoDate);

    nextDays.push(existingDay
      ? {
          ...existingDay,
          dayNumber: index,
          places: existingDay.places.map((place, placeIndex) => ({
            ...place,
            media: cloneMediaItems(place.media),
            order: place.order ?? placeIndex,
          })),
        }
      : createDay(index, isoDate));
  }

  return normalizeBookingGroups(nextDays);
}

function normalizeBookingGroups(days: JourneyDayInput[]): JourneyDayInput[] {
  const bookingMap = new Map<string, number[]>();

  days.forEach(day => day.places.forEach((place) => {
    if (!place.bookingGroupId) {
      return;
    }

    const dayNumbers = bookingMap.get(place.bookingGroupId) ?? [];
    dayNumbers.push(day.dayNumber);
    bookingMap.set(place.bookingGroupId, dayNumbers);
  }));

  return days.map(day => ({
    ...day,
    places: day.places.map((place) => {
      const linkedDays = place.bookingGroupId ? bookingMap.get(place.bookingGroupId) : undefined;
      if (!linkedDays?.length) {
        return place;
      }

      return {
        ...place,
        bookingEndDayNumber: Math.max(...linkedDays),
        bookingStartDayNumber: Math.min(...linkedDays),
      };
    }),
  }));
}

function replacePlaceInDay(day: JourneyDayInput, targetId: string, nextPlace: JourneyPlaceInput): JourneyDayInput {
  return {
    ...day,
    places: day.places.map(place => (place.id === targetId ? nextPlace : place)),
  };
}

function syncPlaceAcrossGroup(days: JourneyDayInput[], bookingGroupId: string, buildPlace: (place: JourneyPlaceInput, day: JourneyDayInput) => JourneyPlaceInput): JourneyDayInput[] {
  return days.map((day) => {
    const matches = day.places.filter(place => place.bookingGroupId === bookingGroupId);
    if (!matches.length) {
      return day;
    }

    return {
      ...day,
      places: day.places.map((place) => {
        if (place.bookingGroupId !== bookingGroupId) {
          return place;
        }

        return buildPlace(place, day);
      }),
    };
  });
}

function setBookingRange(days: JourneyDayInput[], targetDayId: string, targetPlaceId: string, startDayNumber: number, endDayNumber: number): JourneyDayInput[] {
  const normalizedStart = Math.min(startDayNumber, endDayNumber);
  const normalizedEnd = Math.max(startDayNumber, endDayNumber);
  let sourcePlace: JourneyPlaceInput | undefined;

  for (const day of days) {
    const match = day.places.find(place => place.id === targetPlaceId);
    if (match) {
      sourcePlace = match;
      break;
    }
  }

  if (!sourcePlace) {
    return days;
  }

  const bookingGroupId = sourcePlace.bookingGroupId ?? createClientId('booking');

  const basePlace: JourneyPlaceInput = {
    ...sourcePlace,
    bookingEndDayNumber: normalizedEnd,
    bookingGroupId,
    bookingStartDayNumber: normalizedStart,
    media: cloneMediaItems(sourcePlace.media),
  };

  const nextDays = days.map((day) => {
    const hasLinkedPlace = day.places.some(place => place.bookingGroupId === bookingGroupId);
    const shouldInclude = day.dayNumber >= normalizedStart && day.dayNumber <= normalizedEnd;

    if (!shouldInclude) {
      return {
        ...day,
        places: day.places.filter(place => place.bookingGroupId !== bookingGroupId),
      };
    }

    if (hasLinkedPlace) {
      return {
        ...day,
        places: day.places.map((place, placeIndex) => {
          if (place.bookingGroupId !== bookingGroupId) {
            return place;
          }

          return {
            ...basePlace,
            id: place.id,
            media: cloneMediaItems(basePlace.media),
            order: place.order ?? placeIndex,
          };
        }),
      };
    }

    return {
      ...day,
      places: [
        ...day.places,
        {
          ...basePlace,
          id: day.id === targetDayId ? targetPlaceId : createClientId('place'),
          media: cloneMediaItems(basePlace.media),
          order: day.places.length,
        },
      ],
    };
  });

  return normalizeBookingGroups(nextDays);
}

function createInitialState(initialJourney?: JourneyDetail): PlannerState {
  if (!initialJourney) {
    const today = todayIsoDate();
    return {
      coverImage: '',
      days: [createDay(1, today)],
      description: '',
      endDate: today,
      startDate: today,
      title: '',
    };
  }

  const sortedDays = [...initialJourney.days].sort((left, right) => left.dayNumber - right.dayNumber);
  const startDate = sortedDays[0]?.date ?? todayIsoDate();
  const endDate = sortedDays[sortedDays.length - 1]?.date ?? startDate;

  return {
    coverImage: initialJourney.coverImage,
    days: sortedDays.map((day, dayIndex) => ({
      date: day.date,
      dayNumber: dayIndex + 1,
      id: day.id ?? createClientId('day'),
      notes: day.notes ?? '',
      places: day.places.map((place, placeIndex) => ({
        address: place.address,
        bookingEndDayNumber: place.bookingEndDayNumber ?? day.dayNumber,
        bookingGroupId: place.bookingGroupId ?? createClientId('booking'),
        bookingStartDayNumber: place.bookingStartDayNumber ?? day.dayNumber,
        description: place.description ?? '',
        endTime: place.endTime ?? '',
        id: place.id,
        latitude: place.latitude,
        longitude: place.longitude,
        media: place.media.map((media, mediaIndex) => createMediaInput({
          id: media.id,
          order: media.order ?? mediaIndex,
          previewUrl: media.url,
          thumbnailUrl: media.thumbnailUrl,
          type: media.type,
          url: media.url,
        })),
        name: place.name,
        order: placeIndex,
        startTime: place.startTime ?? '',
        type: place.type,
      })),
    })),
    description: initialJourney.description ?? '',
    endDate,
    startDate,
    title: initialJourney.title,
  };
}

export function useJourneyPlannerForm(initialJourney?: JourneyDetail) {
  const [values, setValues] = useState<PlannerState>(() => createInitialState(initialJourney));
  const [error, setError] = useState<string | null>(null);

  const activeDayOptions = useMemo(
    () => values.days.map(day => ({ date: day.date, dayNumber: day.dayNumber, id: day.id })),
    [values.days],
  );

  const setTitle = (title: string) => {
    setValues(prev => ({ ...prev, title }));
  };

  const setDescription = (description: string) => {
    setValues(prev => ({ ...prev, description }));
  };

  const setCoverImage = (coverImage?: string) => {
    setValues(prev => ({ ...prev, coverImage }));
  };

  const setDateRange = (startDate: string, endDate: string) => {
    const normalizedRange = normalizeDateRange(startDate, endDate);
    setValues(prev => ({
      ...prev,
      days: generateDays(normalizedRange.startDate, normalizedRange.endDate, prev.days),
      endDate: normalizedRange.endDate,
      startDate: normalizedRange.startDate,
    }));
  };

  const addPlace = (dayId: string, type: PlaceType): string => {
    const targetDay = values.days.find(day => day.id === dayId);
    const targetDayNumber = targetDay?.dayNumber ?? 1;
    const nextPlace = createPlace(type, targetDayNumber);

    setValues(prev => ({
      ...prev,
      days: prev.days.map(day => (day.id === dayId
        ? {
            ...day,
            places: [
              ...day.places,
              {
                ...nextPlace,
                order: day.places.length,
              },
            ],
          }
        : day)),
    }));

    return nextPlace.id;
  };

  const removePlace = (dayId: string, placeId: string) => {
    setValues((prev) => {
      const targetDay = prev.days.find(day => day.id === dayId);
      const targetPlace = targetDay?.places.find(place => place.id === placeId);

      if (!targetPlace) {
        return prev;
      }

      if (targetPlace.bookingGroupId) {
        return {
          ...prev,
          days: normalizeBookingGroups(prev.days.map(day => ({
            ...day,
            places: day.places.filter(place => place.bookingGroupId !== targetPlace.bookingGroupId),
          }))),
        };
      }

      return {
        ...prev,
        days: prev.days.map(day => (day.id === dayId
          ? {
              ...day,
              places: day.places.filter(place => place.id !== placeId),
            }
          : day)),
      };
    });
  };

  const updateDayNotes = (dayId: string, notes: string) => {
    setValues(prev => ({
      ...prev,
      days: prev.days.map(day => (day.id === dayId ? { ...day, notes } : day)),
    }));
  };

  const updatePlaceField = (dayId: string, placeId: string, field: EditablePlaceField, value: number | string | PlaceType) => {
    setValues((prev) => {
      const targetDay = prev.days.find(day => day.id === dayId);
      const targetPlace = targetDay?.places.find(place => place.id === placeId);

      if (!targetPlace) {
        return prev;
      }

      const nextPlace = {
        ...targetPlace,
        [field]: value,
      } as JourneyPlaceInput;

      if (targetPlace.bookingGroupId) {
        return {
          ...prev,
          days: syncPlaceAcrossGroup(prev.days, targetPlace.bookingGroupId, (place, day) => ({
            ...nextPlace,
            bookingEndDayNumber: nextPlace.bookingEndDayNumber ?? place.bookingEndDayNumber ?? day.dayNumber,
            bookingGroupId: targetPlace.bookingGroupId,
            bookingStartDayNumber: nextPlace.bookingStartDayNumber ?? place.bookingStartDayNumber ?? day.dayNumber,
            id: place.id,
            media: cloneMediaItems(nextPlace.media),
            order: place.order,
          })),
        };
      }

      return {
        ...prev,
        days: prev.days.map(day => (day.id === dayId ? replacePlaceInDay(day, placeId, nextPlace) : day)),
      };
    });
  };

  const updatePlaceMedia = (dayId: string, placeId: string, media: JourneyPlaceMediaInput[]) => {
    setValues((prev) => {
      const targetDay = prev.days.find(day => day.id === dayId);
      const targetPlace = targetDay?.places.find(place => place.id === placeId);

      if (!targetPlace) {
        return prev;
      }

      const nextMedia = cloneMediaItems(media).map((item, index) => ({
        ...item,
        order: index,
      }));

      if (targetPlace.bookingGroupId) {
        return {
          ...prev,
          days: syncPlaceAcrossGroup(prev.days, targetPlace.bookingGroupId, place => ({
            ...place,
            media: cloneMediaItems(nextMedia),
          })),
        };
      }

      return {
        ...prev,
        days: prev.days.map(day => (day.id === dayId
          ? replacePlaceInDay(day, placeId, {
              ...targetPlace,
              media: nextMedia,
            })
          : day)),
      };
    });
  };

  const updateBookingRange = (dayId: string, placeId: string, startDayNumber: number, endDayNumber: number) => {
    setValues(prev => ({
      ...prev,
      days: setBookingRange(prev.days, dayId, placeId, startDayNumber, endDayNumber),
    }));
  };

  const reorderPlaces = (dayId: string, oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) {
      return;
    }

    setValues(prev => ({
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
          places: nextPlaces.map((place, index) => ({
            ...place,
            order: index,
          })),
        };
      }),
    }));
  };

  const validate = (): boolean => {
    if (!values.title.trim()) {
      setError('Journey title is required.');
      return false;
    }

    if (!values.startDate || !values.endDate) {
      setError('Please choose a start and end date for the journey.');
      return false;
    }

    const parsed = journeyCreateSchema.safeParse({
      coverImage: values.coverImage,
      days: values.days,
      description: values.description,
      title: values.title,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid journey data');
      return false;
    }

    setError(null);
    return true;
  };

  return {
    activeDayOptions,
    addPlace,
    error,
    reorderPlaces,
    setCoverImage,
    setDateRange,
    setDescription,
    setError,
    setTitle,
    updateBookingRange,
    updateDayNotes,
    updatePlaceField,
    updatePlaceMedia,
    removePlace,
    validate,
    values,
  };
}
