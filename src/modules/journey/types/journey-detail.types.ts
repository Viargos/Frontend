import type { PlaceType } from '@/modules/journey/enums/place-type.enum';

export type JourneyMedia = {
  id: string;
  type: 'image' | 'video';
  url: string;
};

export type JourneyPlace = {
  id: string;
  type: PlaceType;
  name: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  startTime?: string;
  endTime?: string;
  media: JourneyMedia[];
};

export type JourneyDay = {
  id?: string;
  dayNumber: number;
  date: string;
  notes?: string;
  places: JourneyPlace[];
};

export type JourneyDetail = {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt?: string;
  days: JourneyDay[];
};
