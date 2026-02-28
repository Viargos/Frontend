export type DiscoverCoordinates = {
  latitude: number;
  longitude: number;
};

export type DiscoverJourneyPlace = {
  id: string;
  name: string;
  type?: string;
  latitude?: number;
  longitude?: number;
};

export type DiscoverJourney = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  coverImage?: string;
  places: DiscoverJourneyPlace[];
};
