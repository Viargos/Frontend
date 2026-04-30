import type { PlaceType } from '@/modules/journey/enums/place-type.enum';

export type JourneyListPlace = {
  address?: string;
  id: string;
  name?: string;
};

export type JourneyListDay = {
  date?: string;
  dayNumber?: number;
  id: string;
  places?: JourneyListPlace[];
};

export type JourneyListUser = {
  email?: string;
  id?: string;
  username: string;
};

export type JourneyListItem = {
  coverImage?: string;
  createdAt: string;
  days?: JourneyListDay[];
  description?: string;
  id: string;
  title: string;
  updatedAt?: string;
  user?: JourneyListUser;
};

export type JourneyPlaceInput = {
  address?: string;
  bookingEndDayNumber?: number;
  bookingGroupId?: string;
  bookingStartDayNumber?: number;
  description?: string;
  endTime?: string;
  id: string;
  latitude?: number;
  longitude?: number;
  media: JourneyPlaceMediaInput[];
  name: string;
  order?: number;
  startTime?: string;
  type: PlaceType;
};

export type JourneyPlaceMediaInput = {
  file?: File;
  id: string;
  order?: number;
  previewUrl: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
  url?: string;
};

export type JourneyDayInput = {
  date: string;
  dayNumber: number;
  id: string;
  notes?: string;
  places: JourneyPlaceInput[];
};

export type JourneyCreateInput = {
  coverImage?: string;
  days: JourneyDayInput[];
  description?: string;
  title: string;
};
