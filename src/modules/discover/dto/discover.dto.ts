export type DiscoverCoordinatesDto = {
  latitude: number;
  longitude: number;
};

export type DiscoverJourneyPlaceDto = {
  id: string;
  name: string;
  type?: string;
  latitude?: number | string;
  longitude?: number | string;
};

export type DiscoverJourneyDayDto = {
  id?: string;
  dayNumber: number;
  date: string;
  places: DiscoverJourneyPlaceDto[];
};

export type DiscoverJourneyDto = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  coverImage?: string;
  days?: DiscoverJourneyDayDto[];
};
