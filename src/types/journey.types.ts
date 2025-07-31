export interface Journey {
  id: string;
  title: string;
  description?: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  days?: JourneyDay[];
  createdAt?: string;
  updatedAt?: string;
}

export interface JourneyDay {
  id: string;
  date: string;
  journey: Journey;
  places?: JourneyDayPlace[];
}

export interface JourneyDayPlace {
  id: string;
  name: string;
  location: string;
  description?: string;
  day: JourneyDay;
}

export interface CreateJourneyDto {
  title: string;
  description?: string;
}

export interface UpdateJourneyDto {
  title?: string;
  description?: string;
}
