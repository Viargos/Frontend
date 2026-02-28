import type { PlaceType } from '@/modules/journey/enums/place-type.enum';

export type JourneyListPlaceDto = {
  address?: string;
  id: string;
  name?: string;
};

export type JourneyListDayDto = {
  date?: string;
  dayNumber?: number;
  id: string;
  places?: JourneyListPlaceDto[];
};

export type JourneyListUserDto = {
  email?: string;
  id?: string;
  username?: string;
};

export type JourneyListItemDto = {
  coverImage?: string | null;
  createdAt: string;
  days?: JourneyListDayDto[];
  description?: string;
  id: string;
  title: string;
  updatedAt?: string;
  user?: JourneyListUserDto;
};

export type CreateJourneyPlaceDto = {
  address?: string;
  description?: string;
  endTime?: string;
  latitude?: number;
  longitude?: number;
  name: string;
  order?: number;
  startTime?: string;
  type: PlaceType;
};

export type CreateJourneyDayDto = {
  date: string;
  dayNumber: number;
  notes?: string;
  places: CreateJourneyPlaceDto[];
};

export type CreateJourneyRequestDto = {
  coverImage?: string;
  days: CreateJourneyDayDto[];
  description?: string;
  title: string;
};
