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

/** Creator on journey payloads from the API (nested `user` on Journey). */
export type DiscoverJourneyUserDto = {
  id: string;
  username?: string;
  profileImage?: string;
};

export type DiscoverJourneyDto = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  coverImage?: string;
  days?: DiscoverJourneyDayDto[];
  user?: DiscoverJourneyUserDto;
};
