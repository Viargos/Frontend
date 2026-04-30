import type { PlaceType } from '@/modules/journey/enums/place-type.enum';

export type JourneyMediaDto = {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  order?: number;
};

export type JourneyPlaceDto = {
  id: string;
  address?: string;
  bookingEndDayNumber?: number;
  bookingGroupId?: string;
  bookingStartDayNumber?: number;
  description?: string;
  endTime?: string;
  latitude?: number | string;
  longitude?: number | string;
  media?: JourneyMediaDto[];
  name: string;
  startTime?: string;
  type: PlaceType;
};

export type JourneyDayDto = {
  id?: string;
  dayNumber: number;
  date: string;
  notes?: string;
  places: JourneyPlaceDto[];
};

export type JourneyDetailDto = {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt?: string;
  days: JourneyDayDto[];
};
