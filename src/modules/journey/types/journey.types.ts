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
  description?: string;
  endTime?: string;
  id: string;
  latitude?: number;
  longitude?: number;
  name: string;
  startTime?: string;
  type: PlaceType;
};

export type JourneyDayInput = {
  date: string;
  dayNumber: number;
  id: string;
  notes?: string;
  places: JourneyPlaceInput[];
};

export type JourneyCreateInput = {
  days: JourneyDayInput[];
  description?: string;
  title: string;
};
