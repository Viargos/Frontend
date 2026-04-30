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

export type DiscoverJourneyCreator = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type DiscoverJourney = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  coverImage?: string;
  places: DiscoverJourneyPlace[];
  /** Present when the API includes the journey author (e.g. nearby search). */
  creator?: DiscoverJourneyCreator;
};
