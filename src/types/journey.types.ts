export enum PlaceType {
  STAY = 'STAY',
  ACTIVITY = 'ACTIVITY',
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  NOTE = 'NOTE',
}

export interface Journey {
  id: string;
  title: string;
  description?: string;
  coverImage?: string | null;
  user: {
    id: string;
    username: string;
    email: string;
  };
  days?: JourneyDay[];
  createdAt?: string;
  updatedAt?: string;
}

export enum JourneyMediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export interface JourneyMedia {
  type: JourneyMediaType;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  order?: number;
}

export interface JourneyDay {
  id: string;
  dayNumber: number;
  date: string;
  notes?: string;
  journey: Journey;
  places?: JourneyPlace[];
}

export interface JourneyPlace {
  id: string;
  type: PlaceType;
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  media?: JourneyMedia[];
  day: JourneyDay;
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
  coverImage?: string | null;
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
  type:
    | 'placeToStay'
    | 'placesToGo'
    | 'food'
    | 'transport'
    | 'notes'
    | 'journeyLocation';
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

export interface DetailedJourney extends Omit<Journey, 'days'> {
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

// New types for comprehensive journey creation
export interface CreateJourneyPlace {
  type: PlaceType;
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[]; // Array of S3 keys for uploaded photos
  media?: JourneyMedia[]; // Optional structured media for places
  hasManualStart?: boolean; // Track if user manually edited start time
  hasManualEnd?: boolean; // Track if user manually edited end time
}

export interface CreateJourneyDay {
  dayNumber: number;
  date: string; // ISO date string
  notes?: string;
  places: CreateJourneyPlace[];
}

export interface JourneyFormData {
  title: string;
  description: string;
  days: CreateJourneyDay[];
}

export interface CreateComprehensiveJourneyDto {
  title: string;
  description?: string;
  days: CreateJourneyDay[];
}
