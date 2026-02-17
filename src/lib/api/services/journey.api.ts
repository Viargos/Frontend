import { httpClient } from '../core/api-client';
import { API_ENDPOINTS } from '../config/endpoints';
import { HttpMethod } from '@/enums';
import { buildUrl } from '@/lib/utils/url.utils';
import {
  transformToDetailedJourney,
  createDuplicateJourneyPayload,
  filterJourneysBySearch,
  calculateJourneyStats,
} from '@/lib/utils/journey-transformation.utils';
import type {
  Journey,
  CreateJourneyDto,
  CreateComprehensiveJourneyDto,
  UpdateJourneyDto,
  DetailedJourney,
  JourneyStats,
  JourneyLocation,
  JourneyBanner,
  AddActivityData,
  UpdateActivityData,
} from '@/types/journey.types';
import type { NearbyJourneysParams } from '@/types/user.types';
import type {
  JourneyListResponseDto,
  GetJourneyByIdResponseDto,
  CreateJourneyResponseDto,
  UpdateJourneyResponseDto,
  AddActivityResponseDto,
  UpdateActivityResponseDto,
  UpdateBannerResponseDto,
  AddDayResponseDto,
  JourneyFiltersDto,
} from '@/lib/dtos/journey';

export class JourneyApiService {
  /**
   * Get current user's journeys
   * @param filters Optional filters for pagination and sorting
   * @returns Array of journeys (unwrapped from { data: Journey[] })
   */
  async getMyJourneys(filters?: JourneyFiltersDto): Promise<Journey[]> {
    const url = buildUrl(API_ENDPOINTS.JOURNEYS.LIST, filters);
    const response = await httpClient.get<JourneyListResponseDto>(url);
    return response.data;
  }

  /**
   * Get all journeys (alias for getMyJourneys)
   * @param filters Optional filters for pagination and sorting
   * @returns Array of journeys (unwrapped from { data: Journey[] })
   */
  async getAllJourneys(filters?: JourneyFiltersDto): Promise<Journey[]> {
    return this.getMyJourneys(filters);
  }

  /**
   * Get journey by ID
   * @param id Journey ID
   * @returns Journey entity (unwrapped from { data: Journey })
   */
  async getById(id: string): Promise<Journey> {
    const response = await httpClient.get<GetJourneyByIdResponseDto>(
      API_ENDPOINTS.JOURNEYS.GET(id)
    );
    return response.data;
  }

  /**
   * Get nearby journeys based on location
   * @param params Location parameters (latitude, longitude, radius, limit)
   * @returns Array of journeys (unwrapped from { data: Journey[] })
   */
  async getNearby(params: NearbyJourneysParams): Promise<Journey[]> {
    const searchParams = new URLSearchParams({
      latitude: params.latitude.toString(),
      longitude: params.longitude.toString(),
      radius: params.radius.toString(),
      limit: String(params.limit ?? 20),
    });
    const url = `${API_ENDPOINTS.JOURNEYS.NEARBY}?${searchParams.toString()}`;
    const response = await httpClient.get<JourneyListResponseDto>(url);
    return response.data;
  }

  /**
   * Create a new journey
   * @param data Journey creation data
   * @returns Created journey (unwrapped from { data: Journey })
   */
  async createJourney(data: CreateJourneyDto): Promise<Journey> {
    const response = await httpClient.post<CreateJourneyResponseDto>(
      API_ENDPOINTS.JOURNEYS.CREATE,
      data
    );
    return response.data;
  }

  /**
   * Create a comprehensive journey with days and activities
   * @param data Comprehensive journey creation data
   * @returns Created journey (unwrapped from { data: Journey })
   */
  async createComprehensiveJourney(
    data: CreateComprehensiveJourneyDto
  ): Promise<Journey> {
    const response = await httpClient.post<CreateJourneyResponseDto>(
      API_ENDPOINTS.JOURNEYS.CREATE,
      data
    );
    return response.data;
  }

  /**
   * Update journey details
   * @param id Journey ID
   * @param data Journey update data
   * @returns Updated journey (unwrapped from { data: Journey })
   */
  async updateJourney(
    id: string,
    data: UpdateJourneyDto
  ): Promise<Journey> {
    const response = await httpClient.request<UpdateJourneyResponseDto>(
      API_ENDPOINTS.JOURNEYS.UPDATE(id),
      { method: HttpMethod.PATCH, body: data }
    );
    return response.data;
  }

  /**
   * Delete a journey
   * @param id Journey ID to delete
   */
  async deleteJourney(id: string): Promise<void> {
    await httpClient.delete<unknown>(API_ENDPOINTS.JOURNEYS.DELETE(id));
  }

  /**
   * Duplicate an existing journey
   * @param id Journey ID to duplicate
   * @param newTitle Optional new title for the copy
   * @returns Created journey copy
   */
  async duplicateJourney(id: string, newTitle?: string): Promise<Journey> {
    const source = await this.getById(id);
    const createData = createDuplicateJourneyPayload(source, newTitle);
    return this.createComprehensiveJourney(createData);
  }

  /**
   * Get detailed journey with structured activities
   * @param id Journey ID
   * @returns Detailed journey with activities grouped by type
   */
  async getDetailedJourney(id: string): Promise<DetailedJourney> {
    const journey = await this.getById(id);
    return transformToDetailedJourney(journey);
  }

  /**
   * Search journeys by query
   * @param query Search query
   * @param filters Optional filters
   * @returns Filtered journeys
   */
  async searchJourneys(
    query: string,
    filters?: JourneyFiltersDto
  ): Promise<Journey[]> {
    const allJourneys = await this.getMyJourneys(filters);
    return filterJourneysBySearch(allJourneys, query);
  }

  /**
   * Get journey statistics
   * @param userId Optional user ID for user-specific stats
   * @returns Journey statistics
   */
  async getJourneyStats(userId?: string): Promise<JourneyStats> {
    const journeys = userId
      ? await this.getAllJourneys()
      : await this.getMyJourneys();
    return calculateJourneyStats(journeys);
  }

  /**
   * Add activity to journey day
   * @param journeyId Journey ID
   * @param data Activity data
   * @returns Created activity (unwrapped from { data: JourneyLocation })
   */
  async addActivityToDay(
    journeyId: string,
    data: AddActivityData
  ): Promise<JourneyLocation> {
    const response = await httpClient.post<AddActivityResponseDto>(
      API_ENDPOINTS.JOURNEYS.ACTIVITIES(journeyId),
      data
    );
    return response.data;
  }

  /**
   * Update activity details
   * @param journeyId Journey ID
   * @param data Activity update data with locationId
   * @returns Updated activity (unwrapped from { data: JourneyLocation })
   */
  async updateActivity(
    journeyId: string,
    data: UpdateActivityData
  ): Promise<JourneyLocation> {
    const { locationId, updates } = data;
    const response = await httpClient.request<UpdateActivityResponseDto>(
      API_ENDPOINTS.JOURNEYS.ACTIVITY(journeyId, locationId),
      { method: HttpMethod.PUT, body: updates }
    );
    return response.data;
  }

  /**
   * Remove activity from journey
   * @param journeyId Journey ID
   * @param locationId Location ID to remove
   */
  async removeActivity(journeyId: string, locationId: string): Promise<void> {
    await httpClient.delete(
      API_ENDPOINTS.JOURNEYS.ACTIVITY(journeyId, locationId)
    );
  }

  /**
   * Reorder activities within a day
   * @param journeyId Journey ID
   * @param dayId Day ID
   * @param locationIds Ordered array of location IDs
   */
  async reorderActivities(
    journeyId: string,
    dayId: string,
    locationIds: string[]
  ): Promise<void> {
    await httpClient.request(
      API_ENDPOINTS.JOURNEYS.REORDER_ACTIVITIES(journeyId),
      {
        method: HttpMethod.PUT,
        body: { dayId, locationIds },
      }
    );
  }

  /**
   * Update journey banner
   * @param id Journey ID
   * @param banner Banner data
   * @returns Updated detailed journey (unwrapped from { data: DetailedJourney })
   */
  async updateJourneyBanner(
    id: string,
    banner: JourneyBanner
  ): Promise<DetailedJourney> {
    const response = await httpClient.request<UpdateBannerResponseDto>(
      API_ENDPOINTS.JOURNEYS.BANNER(id),
      {
        method: HttpMethod.PUT,
        body: banner,
      }
    );
    return response.data;
  }

  /**
   * Add day to journey
   * @param id Journey ID
   * @param day Day data with date
   * @returns Updated detailed journey (unwrapped from { data: DetailedJourney })
   */
  async addDayToJourney(
    id: string,
    day: { date: string }
  ): Promise<DetailedJourney> {
    const response = await httpClient.post<AddDayResponseDto>(
      API_ENDPOINTS.JOURNEYS.DAYS(id),
      day
    );
    return response.data;
  }

  /**
   * Remove day from journey
   * @param id Journey ID
   * @param dayId Day ID to remove
   * @returns Updated detailed journey (unwrapped from { data: DetailedJourney })
   */
  async removeDayFromJourney(
    id: string,
    dayId: string
  ): Promise<DetailedJourney> {
    const response = await httpClient.delete<AddDayResponseDto>(
      API_ENDPOINTS.JOURNEYS.DAY(id, dayId)
    );
    return response.data;
  }
}

export const JourneyApi = new JourneyApiService();
