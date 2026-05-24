import type { PlaceType } from '@/modules/journey/enums/place-type.enum';

export type JourneyMedia = {
  id: string;
  order?: number;
  thumbnailUrl?: string;
  type: 'image' | 'video';
  url: string;
};

export type JourneyPlace = {
  address?: string;
  bookingEndDayNumber?: number;
  bookingGroupId?: string;
  bookingStartDayNumber?: number;
  description?: string;
  endTime?: string;
  id: string;
  latitude?: number;
  longitude?: number;
  media: JourneyMedia[];
  name: string;
  startTime?: string;
  type: PlaceType;
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
  user?: {
    email?: string;
    id?: string;
    username?: string;
  };
  days: JourneyDay[];
};
