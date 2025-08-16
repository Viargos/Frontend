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

export interface JourneyFilters {
  status?: 'draft' | 'published' | 'archived';
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  tags?: string[];
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface JourneyStats {
  totalJourneys: number;
  publishedJourneys: number;
  draftJourneys: number;
  archivedJourneys: number;
  totalPlaces: number;
  totalDays: number;
  mostVisitedLocation?: string;
}

export interface JourneyLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'placeToStay' | 'placesToGo' | 'food' | 'transport' | 'notes' | 'journeyLocation';
  address?: string;
  description?: string;
  images?: string[];
  rating?: number;
  price?: string;
  openingHours?: string;
  website?: string;
  phone?: string;
}

export interface JourneyDayActivities {
  placeToStay: JourneyLocation[];
  placesToGo: JourneyLocation[];
  food: JourneyLocation[];
  transport: JourneyLocation[];
  notes: JourneyLocation[];
}

export interface DetailedJourneyDay {
  id: string;
  dayNumber: number;
  date: string;
  activities: JourneyDayActivities;
  budget?: number;
  weather?: {
    temperature: number;
    condition: string;
    icon: string;
  };
  notes?: string;
}

export interface JourneyBanner {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  gradientColors: {
    from: string;
    via: string;
    to: string;
  };
}

export interface DetailedJourney extends Journey {
  banner?: JourneyBanner;
  days: DetailedJourneyDay[];
  totalBudget?: number;
  currency?: string;
  isPublic?: boolean;
  collaborators?: string[];
  tags?: string[];
  difficulty?: 'easy' | 'moderate' | 'challenging';
  duration?: number; // in hours
  distance?: number; // in km
  transportation?: string[];
  bestTimeToVisit?: string;
  language?: string;
  emergencyContacts?: {
    name: string;
    phone: string;
    relationship: string;
  }[];
}

export interface JourneyState {
  journeys: Journey[];
  currentJourney: Journey | null;
  detailedJourney: DetailedJourney | null;
  stats: JourneyStats | null;
  isLoading: boolean;
  isLoadingDetailed: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isSavingActivity: boolean;
  error: string | null;
  filters: JourneyFilters;
  searchQuery: string;
  selectedDay: number;
  selectedLocation: JourneyLocation | null;
}

export interface AddActivityData {
  dayId: string;
  category: keyof JourneyDayActivities;
  location: Omit<JourneyLocation, 'id' | 'type'>;
}

export interface UpdateActivityData {
  locationId: string;
  updates: Partial<JourneyLocation>;
}

export interface JourneySettings {
  currency: string;
  timezone: string;
  language: string;
  units: 'metric' | 'imperial';
  visibility: 'private' | 'public' | 'friends';
}
