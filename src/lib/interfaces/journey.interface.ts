import {
  Journey,
  CreateJourneyDto,
  UpdateJourneyDto,
  JourneyFilters,
  JourneyStats,
  DetailedJourney,
  JourneyBanner,
  AddActivityData,
  UpdateActivityData,
  JourneyLocation,
} from '@/types/journey.types';
import type { JourneyListResponseDto } from '@/lib/dtos/journey';

export interface IJourneyService {
  // Journey CRUD operations
  getMyJourneys(filters?: JourneyFilters): Promise<JourneyListResponseDto>;
  getAllJourneys(filters?: JourneyFilters): Promise<JourneyListResponseDto>;
  getJourneyById(id: string): Promise<Journey>;
  createJourney(data: CreateJourneyDto): Promise<Journey>;
  updateJourney(id: string, data: UpdateJourneyDto): Promise<Journey>;
  deleteJourney(id: string): Promise<void>;
  
  // Detailed Journey operations
  getDetailedJourney(id: string): Promise<DetailedJourney>;
  updateJourneyBanner(id: string, banner: JourneyBanner): Promise<DetailedJourney>;
  addDayToJourney(id: string, day: { date: string }): Promise<DetailedJourney>;
  removeDayFromJourney(id: string, dayId: string): Promise<DetailedJourney>;
  
  // Activity management
  addActivityToDay(journeyId: string, data: AddActivityData): Promise<JourneyLocation>;
  updateActivity(journeyId: string, data: UpdateActivityData): Promise<JourneyLocation>;
  removeActivity(journeyId: string, locationId: string): Promise<void>;
  reorderActivities(journeyId: string, dayId: string, locationIds: string[]): Promise<void>;
  
  // Journey statistics
  getJourneyStats(userId?: string): Promise<JourneyStats>;
  
  // Journey search and filtering
  searchJourneys(query: string, filters?: JourneyFilters): Promise<Journey[]>;
  
  // Journey sharing and collaboration
  shareJourney(id: string, shareData: { isPublic: boolean }): Promise<void>;
  duplicateJourney(id: string, newTitle?: string): Promise<Journey>;
  
  // Location services
  getLocationDetails(locationId: string): Promise<JourneyLocation>;
}
