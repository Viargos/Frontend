/**
 * Journey Service - Migrated Version
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Handles only journey-related operations
 * - Open/Closed: Open for extension through interfaces, closed for modification
 * - Liskov Substitution: Implements IJourneyService interface correctly
 * - Interface Segregation: Depends only on required dependencies
 * - Dependency Inversion: Depends on abstractions where possible
 *
 * Improvements:
 * - Centralized error messages (ERROR_MESSAGES)
 * - Structured logging with logger
 * - Better error handling with ErrorHandler
 * - Type-safe implementations
 * - Event tracking for analytics
 * - Private helper methods for separation of concerns (SRP)
 */

import { IJourneyService } from "@/lib/interfaces/journey.interface";
import {
  Journey,
  CreateJourneyDto,
  UpdateJourneyDto,
  CreateComprehensiveJourneyDto,
  JourneyFilters,
  JourneyStats,
  DetailedJourney,
  JourneyBanner,
  AddActivityData,
  UpdateActivityData,
  JourneyLocation,
  DetailedJourneyDay,
  JourneyDayActivities,
} from "@/types/journey.types";
import apiClient from "@/lib/api.legacy";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, VALIDATION_RULES } from "@/constants";
import { logger } from "@/utils/logger";
import { ErrorHandler } from "@/utils/error-handler";

export class JourneyService implements IJourneyService {
  constructor() {
    logger.debug('JourneyService initialized');
  }

  /**
   * Get user's journeys
   */
  async getMyJourneys(filters?: JourneyFilters): Promise<Journey[]> {
    logger.debug('Fetching user journeys', { filters });

    try {
      const response = await apiClient.getMyJourneys();

      // Log full API response for debugging
      console.log("[JOURNEY_API_RESPONSE]", {
        statusCode: response.statusCode,
        dataLength: Array.isArray(response.data) ? response.data.length : 
                     (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray((response.data as any).data)) 
                       ? (response.data as any).data.length : 0,
        response: response
      });

      if (response.statusCode !== 10000 && response.statusCode !== 200) {
        throw new Error(response.message || ERROR_MESSAGES.JOURNEY.FETCH_LIST_FAILED);
      }

      if (!response.data) {
        throw new Error('No data received from server');
      }

      let journeys = this.extractJourneysFromResponse(response.data);

      // Log before filtering
      console.log("[JOURNEYS_BEFORE_FILTER]", {
        count: journeys.length,
        filters: filters
      });

      if (filters) {
        journeys = this.applyFilters(journeys, filters);
      }

      // Log after filtering
      console.log("[JOURNEYS_AFTER_FILTER]", {
        count: journeys.length,
        filters: filters
      });

      logger.info('User journeys fetched', {
        count: journeys.length,
        hasFilters: !!filters,
      });

      return journeys;
    } catch (error) {
      logger.error('Failed to fetch user journeys', error as Error, { filters });

      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.FETCH_LIST_FAILED);
    }
  }

  /**
   * Get all public journeys
   */
  async getAllJourneys(filters?: JourneyFilters): Promise<Journey[]> {
    logger.debug('Fetching all public journeys', { filters });

    try {
      const response = await apiClient.getAllJourneys();

      // Log full API response for debugging
      console.log("[ALL_JOURNEYS_API_RESPONSE]", {
        statusCode: response.statusCode,
        message: response.message,
        isArray: Array.isArray(response),
        hasData: !!response.data,
        dataIsArray: Array.isArray(response.data),
        dataLength: Array.isArray(response.data) ? response.data.length : (Array.isArray(response) ? response.length : 0),
        response: response
      });

      // Handle case where backend returns array directly (not wrapped in ApiResponse)
      let journeys: Journey[] = [];
      if (Array.isArray(response)) {
        // Backend returned array directly
        journeys = response;
        console.log("[ALL_JOURNEYS_DIRECT_ARRAY]", { count: journeys.length });
      } else if (response.data) {
        // Backend returned wrapped response
        // Accept both 200 and 10000 as success status codes (consistent with getMyJourneys)
        if (response.statusCode !== 10000 && response.statusCode !== 200 && response.statusCode !== undefined) {
          throw new Error(response.message || ERROR_MESSAGES.JOURNEY.FETCH_LIST_FAILED);
        }
        
        // Use the same extraction logic as getMyJourneys to handle different response formats
        journeys = this.extractJourneysFromResponse(response.data);
      } else {
        throw new Error('No data received from server');
      }

      // Log before filtering
      console.log("[ALL_JOURNEYS_BEFORE_FILTER]", {
        count: journeys.length,
        filters: filters
      });

      if (filters) {
        journeys = this.applyFilters(journeys, filters);
      }

      // Log after filtering
      console.log("[ALL_JOURNEYS_AFTER_FILTER]", {
        count: journeys.length,
        filters: filters
      });

      logger.info('Public journeys fetched', {
        count: journeys.length,
        hasFilters: !!filters,
      });

      return journeys;
    } catch (error) {
      logger.error('Failed to fetch public journeys', error as Error, { filters });

      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.FETCH_LIST_FAILED);
    }
  }

  /**
   * Get journey by ID
   */
  async getJourneyById(id: string): Promise<Journey> {
    logger.debug('Fetching journey by ID', { journeyId: id });

    try {
      this.validateJourneyId(id);

      const response = await apiClient.getJourney(id);

      if (response.statusCode !== 10000 || !response.data) {
        throw new Error(response.message || ERROR_MESSAGES.JOURNEY.FETCH_FAILED);
      }

      logger.info('Journey fetched successfully', {
        journeyId: id,
        title: response.data.title,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch journey', error as Error, { journeyId: id });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.FETCH_FAILED);
    }
  }

  /**
   * Create a new journey
   */
  async createJourney(data: CreateJourneyDto): Promise<Journey> {
    logger.info('Creating journey', {
      title: data.title,
      hasDescription: !!data.description,
    });

    try {
      this.validateJourneyCreateData(data);

      const journeyData = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
      };

      const response = await apiClient.createJourney(journeyData);

      if (response.statusCode !== 201 && response.statusCode !== 200) {
        throw new Error(response.message || ERROR_MESSAGES.JOURNEY.CREATE_FAILED);
      }

      if (!response.data) {
        throw new Error('No journey data returned from server');
      }

      logger.info('Journey created successfully', {
        journeyId: response.data.id,
        title: response.data.title,
      });

      logger.trackEvent('journey_created', {
        journeyId: response.data.id,
        hasDescription: !!data.description,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create journey', error as Error, { data });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.CREATE_FAILED);
    }
  }

  /**
   * Create comprehensive journey with days and places
   */
  async createComprehensiveJourney(data: CreateComprehensiveJourneyDto): Promise<Journey> {
    logger.info('Creating comprehensive journey', {
      title: data.title,
      daysCount: data.days?.length || 0,
    });

    try {
      this.validateComprehensiveJourneyData(data);

      const journeyData = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        days: data.days.map((day) => ({
          ...day,
          places: day.places.map((place) => ({
            ...place,
            name: place.name.trim(),
            description: place.description?.trim() || undefined,
          })),
        })),
      };

      const response = await apiClient.createComprehensiveJourney(journeyData);

      if (response.statusCode !== 201 && response.statusCode !== 200) {
        throw new Error(response.message || ERROR_MESSAGES.JOURNEY.CREATE_FAILED);
      }

      if (!response.data) {
        throw new Error('No journey data returned from server');
      }

      logger.info('Comprehensive journey created', {
        journeyId: response.data.id,
        daysCount: data.days.length,
      });

      logger.trackEvent('comprehensive_journey_created', {
        journeyId: response.data.id,
        daysCount: data.days.length,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create comprehensive journey', error as Error, { data });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.CREATE_FAILED);
    }
  }

  /**
   * Update journey
   */
  async updateJourney(id: string, data: UpdateJourneyDto): Promise<Journey> {
    logger.info('Updating journey', {
      journeyId: id,
      hasTitle: !!data.title,
      hasDescription: data.description !== undefined,
    });

    try {
      this.validateJourneyId(id);
      this.validateJourneyUpdateData(data);

      const updateData = {
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.description !== undefined && {
          description: data.description.trim() || null,
        }),
      };

      const response = await apiClient.updateJourney(id, updateData);

      if (response.statusCode !== 200 || !response.data) {
        throw new Error(response.message || ERROR_MESSAGES.JOURNEY.UPDATE_FAILED);
      }

      logger.info('Journey updated successfully', {
        journeyId: id,
      });

      logger.trackEvent('journey_updated', {
        journeyId: id,
        updatedFields: Object.keys(updateData),
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to update journey', error as Error, { journeyId: id, data });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.UPDATE_FAILED);
    }
  }

  /**
   * Delete journey
   */
  async deleteJourney(id: string): Promise<void> {
    logger.info('Deleting journey', { journeyId: id });

    try {
      this.validateJourneyId(id);

      const response = await apiClient.deleteJourney(id);

      // Backend returns { success: true } for successful deletion
      // Also check for statusCode in case response format changes
      const isSuccess = response?.success === true || 
                       (response?.statusCode && [200, 204, 10000].includes(response.statusCode));
      
      if (!isSuccess) {
        throw new Error(response?.message || ERROR_MESSAGES.JOURNEY.DELETE_FAILED);
      }

      logger.info('Journey deleted successfully', { journeyId: id });

      logger.trackEvent('journey_deleted', { journeyId: id });
    } catch (error) {
      const errorMessage = ErrorHandler.extractMessage(error);
      
      // Don't log error if journey is already deleted (idempotent operation)
      if (!errorMessage.toLowerCase().includes('journey not found')) {
        logger.error('Failed to delete journey', error as Error, { journeyId: id });
      }
      
      throw new Error(errorMessage || ERROR_MESSAGES.JOURNEY.DELETE_FAILED);
    }
  }

  /**
   * Get journey statistics
   */
  async getJourneyStats(userId?: string): Promise<JourneyStats> {
    logger.debug('Fetching journey stats', { userId });

    try {
      const journeys = userId
        ? await this.getAllJourneys()
        : await this.getMyJourneys();

      const stats: JourneyStats = {
        totalJourneys: journeys.length,
        publishedJourneys: journeys.length,
        draftJourneys: 0,
        archivedJourneys: 0,
        totalPlaces: journeys.reduce((total, journey) => {
          return (
            total +
            (journey.days?.reduce((dayTotal, day) => {
              return dayTotal + (day.places?.length || 0);
            }, 0) || 0)
          );
        }, 0),
        totalDays: journeys.reduce((total, journey) => {
          return total + (journey.days?.length || 0);
        }, 0),
        mostVisitedLocation: this.getMostVisitedLocation(journeys),
      };

      logger.debug('Journey stats calculated', stats);

      return stats;
    } catch (error) {
      logger.error('Failed to fetch journey stats', error as Error, { userId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.FETCH_FAILED);
    }
  }

  /**
   * Search journeys
   */
  async searchJourneys(query: string, filters?: JourneyFilters): Promise<Journey[]> {
    logger.debug('Searching journeys', { query, filters });

    try {
      if (!query || typeof query !== 'string') {
        throw new Error('Search query is required');
      }

      const allJourneys = await this.getAllJourneys(filters);
      const searchTerm = query.toLowerCase().trim();

      const filteredJourneys = allJourneys.filter(
        (journey) =>
          journey.title.toLowerCase().includes(searchTerm) ||
          journey.description?.toLowerCase().includes(searchTerm) ||
          journey.user.username.toLowerCase().includes(searchTerm)
      );

      logger.info('Journey search completed', {
        query,
        resultCount: filteredJourneys.length,
      });

      logger.trackEvent('journeys_searched', {
        query,
        resultCount: filteredJourneys.length,
      });

      return filteredJourneys;
    } catch (error) {
      logger.error('Journey search failed', error as Error, { query });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.SEARCH_FAILED);
    }
  }

  /**
   * Share journey (toggle public/private)
   */
  async shareJourney(id: string, shareData: { isPublic: boolean }): Promise<void> {
    logger.info('Sharing journey', { journeyId: id, isPublic: shareData.isPublic });

    try {
      this.validateJourneyId(id);

      await this.updateJourney(id, {
        description: shareData.isPublic ? "Public journey" : "Private journey",
      });

      logger.trackEvent('journey_shared', {
        journeyId: id,
        isPublic: shareData.isPublic,
      });
    } catch (error) {
      logger.error('Failed to share journey', error as Error, { journeyId: id });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.UPDATE_FAILED);
    }
  }

  /**
   * Duplicate journey
   */
  async duplicateJourney(id: string, newTitle?: string): Promise<Journey> {
    logger.info('Duplicating journey', { journeyId: id, newTitle });

    try {
      this.validateJourneyId(id);

      const originalJourney = await this.getJourneyById(id);
      const duplicatedTitle = newTitle || `${originalJourney.title} (Copy)`;

      const createData: CreateJourneyDto = {
        title: duplicatedTitle,
        description: originalJourney.description,
      };

      const duplicated = await this.createJourney(createData);

      logger.trackEvent('journey_duplicated', {
        originalId: id,
        duplicatedId: duplicated.id,
      });

      return duplicated;
    } catch (error) {
      logger.error('Failed to duplicate journey', error as Error, { journeyId: id });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.CREATE_FAILED);
    }
  }

  /**
   * Get detailed journey
   */
  async getDetailedJourney(id: string): Promise<DetailedJourney> {
    logger.debug('Fetching detailed journey', { journeyId: id });

    try {
      this.validateJourneyId(id);

      const basicJourney = await this.getJourneyById(id);

      const detailedJourney: DetailedJourney = {
        ...basicJourney,
        banner: this.createDefaultBanner(basicJourney),
        days: this.createDetailedDays(basicJourney),
        totalBudget: 1500,
        currency: "USD",
        isPublic: false,
        tags: ["adventure", "cultural", "food"],
        difficulty: "moderate",
        duration: 72,
        distance: 50,
        transportation: ["car", "walking"],
        bestTimeToVisit: "Oct-Mar",
        language: "English",
      };

      logger.debug('Detailed journey created', {
        journeyId: id,
        daysCount: detailedJourney.days.length,
      });

      return detailedJourney;
    } catch (error) {
      logger.error('Failed to fetch detailed journey', error as Error, { journeyId: id });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.FETCH_FAILED);
    }
  }

  /**
   * Update journey banner
   */
  async updateJourneyBanner(id: string, banner: JourneyBanner): Promise<DetailedJourney> {
    logger.info('Updating journey banner', { journeyId: id });

    try {
      this.validateJourneyId(id);

      const detailedJourney = await this.getDetailedJourney(id);

      logger.trackEvent('journey_banner_updated', { journeyId: id });

      return {
        ...detailedJourney,
        banner,
      };
    } catch (error) {
      logger.error('Failed to update journey banner', error as Error, { journeyId: id });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.UPDATE_FAILED);
    }
  }

  /**
   * Add day to journey
   */
  async addDayToJourney(id: string, day: { date: string }): Promise<DetailedJourney> {
    logger.info('Adding day to journey', { journeyId: id, date: day.date });

    try {
      this.validateJourneyId(id);

      const detailedJourney = await this.getDetailedJourney(id);
      const newDay: DetailedJourneyDay = {
        id: `day-${Date.now()}`,
        dayNumber: detailedJourney.days.length + 1,
        date: day.date,
        activities: {
          placeToStay: [],
          placesToGo: [],
          food: [],
          transport: [],
          notes: [],
        },
      };

      logger.trackEvent('journey_day_added', {
        journeyId: id,
        dayNumber: newDay.dayNumber,
      });

      return {
        ...detailedJourney,
        days: [...detailedJourney.days, newDay],
      };
    } catch (error) {
      logger.error('Failed to add day to journey', error as Error, { journeyId: id });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.UPDATE_FAILED);
    }
  }

  /**
   * Remove day from journey
   */
  async removeDayFromJourney(id: string, dayId: string): Promise<DetailedJourney> {
    logger.info('Removing day from journey', { journeyId: id, dayId });

    try {
      this.validateJourneyId(id);

      const detailedJourney = await this.getDetailedJourney(id);
      const updatedDays = detailedJourney.days.filter((day) => day.id !== dayId);

      updatedDays.forEach((day, index) => {
        day.dayNumber = index + 1;
      });

      logger.trackEvent('journey_day_removed', { journeyId: id, dayId });

      return {
        ...detailedJourney,
        days: updatedDays,
      };
    } catch (error) {
      logger.error('Failed to remove day from journey', error as Error, { journeyId: id, dayId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.UPDATE_FAILED);
    }
  }

  /**
   * Add activity to day
   */
  async addActivityToDay(journeyId: string, data: AddActivityData): Promise<JourneyLocation> {
    logger.info('Adding activity to journey day', {
      journeyId,
      category: data.category,
    });

    try {
      this.validateJourneyId(journeyId);

      const newLocation: JourneyLocation = {
        id: `location-${Date.now()}`,
        type: data.category,
        ...data.location,
      };

      logger.trackEvent('journey_activity_added', {
        journeyId,
        category: data.category,
      });

      return newLocation;
    } catch (error) {
      logger.error('Failed to add activity', error as Error, { journeyId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.UPDATE_FAILED);
    }
  }

  /**
   * Update activity
   */
  async updateActivity(journeyId: string, data: UpdateActivityData): Promise<JourneyLocation> {
    logger.info('Updating journey activity', {
      journeyId,
      locationId: data.locationId,
    });

    try {
      this.validateJourneyId(journeyId);

      const updatedLocation: JourneyLocation = {
        id: data.locationId,
        name: data.updates.name || "Updated Location",
        lat: data.updates.lat || 0,
        lng: data.updates.lng || 0,
        type: data.updates.type || "placesToGo",
        ...data.updates,
      };

      logger.trackEvent('journey_activity_updated', {
        journeyId,
        locationId: data.locationId,
      });

      return updatedLocation;
    } catch (error) {
      logger.error('Failed to update activity', error as Error, { journeyId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.UPDATE_FAILED);
    }
  }

  /**
   * Remove activity
   */
  async removeActivity(journeyId: string, locationId: string): Promise<void> {
    logger.info('Removing activity from journey', { journeyId, locationId });

    try {
      this.validateJourneyId(journeyId);

      if (!locationId || typeof locationId !== 'string') {
        throw new Error('Valid location ID is required');
      }

      logger.trackEvent('journey_activity_removed', { journeyId, locationId });
    } catch (error) {
      logger.error('Failed to remove activity', error as Error, { journeyId, locationId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.UPDATE_FAILED);
    }
  }

  /**
   * Reorder activities
   */
  async reorderActivities(journeyId: string, dayId: string, locationIds: string[]): Promise<void> {
    logger.debug('Reordering journey activities', {
      journeyId,
      dayId,
      count: locationIds.length,
    });

    try {
      this.validateJourneyId(journeyId);

      if (!dayId || typeof dayId !== 'string') {
        throw new Error('Valid day ID is required');
      }

      logger.trackEvent('journey_activities_reordered', {
        journeyId,
        dayId,
        count: locationIds.length,
      });
    } catch (error) {
      logger.error('Failed to reorder activities', error as Error, { journeyId, dayId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.JOURNEY.UPDATE_FAILED);
    }
  }

  /**
   * Search locations
   */
  async searchLocations(query: string, center?: { lat: number; lng: number }): Promise<JourneyLocation[]> {
    logger.debug('Searching locations', { query, hasCenter: !!center });

    try {
      if (!query || typeof query !== 'string') {
        throw new Error('Search query is required');
      }

      const mockLocations: JourneyLocation[] = [
        {
          id: "loc1",
          name: `${query} Restaurant`,
          lat: (center?.lat || 17.385) + (Math.random() - 0.5) * 0.01,
          lng: (center?.lng || 78.4867) + (Math.random() - 0.5) * 0.01,
          type: "food",
          address: `123 ${query} Street`,
          rating: 4.2,
        },
        {
          id: "loc2",
          name: `${query} Hotel`,
          lat: (center?.lat || 17.385) + (Math.random() - 0.5) * 0.01,
          lng: (center?.lng || 78.4867) + (Math.random() - 0.5) * 0.01,
          type: "placeToStay",
          address: `456 ${query} Avenue`,
          rating: 4.5,
        },
      ];

      logger.debug('Location search completed', {
        query,
        resultCount: mockLocations.length,
      });

      return mockLocations;
    } catch (error) {
      logger.error('Location search failed', error as Error, { query });
      throw new Error(ErrorHandler.extractMessage(error) || 'Failed to search locations');
    }
  }

  /**
   * Get location details
   */
  async getLocationDetails(locationId: string): Promise<JourneyLocation> {
    logger.debug('Fetching location details', { locationId });

    try {
      if (!locationId || typeof locationId !== 'string') {
        throw new Error('Valid location ID is required');
      }

      const mockLocation: JourneyLocation = {
        id: locationId,
        name: "Sample Location",
        lat: 17.385,
        lng: 78.4867,
        type: "placesToGo",
        address: "123 Sample Street",
        description: "A beautiful place to visit",
        rating: 4.3,
        price: "$$",
        openingHours: "9:00 AM - 6:00 PM",
        website: "https://example.com",
        phone: "+1234567890",
        images: [],
      };

      logger.debug('Location details fetched', { locationId });

      return mockLocation;
    } catch (error) {
      logger.error('Failed to fetch location details', error as Error, { locationId });
      throw new Error(ErrorHandler.extractMessage(error) || 'Failed to fetch location details');
    }
  }

  // ==================== Private Helper Methods (SRP) ====================

  /**
   * Validate journey ID
   * Single Responsibility: Separate validation logic
   */
  private validateJourneyId(id: string): void {
    if (!id || typeof id !== 'string') {
      throw new Error('Valid journey ID is required');
    }
  }

  /**
   * Validate journey create data
   * Single Responsibility: Separate validation logic
   */
  private validateJourneyCreateData(data: CreateJourneyDto): void {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('Journey title'));
    }

    if (data.title.length > VALIDATION_RULES.JOURNEY.TITLE_MAX_LENGTH) {
      throw new Error(
        ERROR_MESSAGES.VALIDATION.MAX_LENGTH('Journey title', VALIDATION_RULES.JOURNEY.TITLE_MAX_LENGTH)
      );
    }

    if (data.description && data.description.length > VALIDATION_RULES.JOURNEY.DESCRIPTION_MAX_LENGTH) {
      throw new Error(
        ERROR_MESSAGES.VALIDATION.MAX_LENGTH('Journey description', VALIDATION_RULES.JOURNEY.DESCRIPTION_MAX_LENGTH)
      );
    }
  }

  /**
   * Validate comprehensive journey data
   * Single Responsibility: Separate validation logic
   */
  private validateComprehensiveJourneyData(data: CreateComprehensiveJourneyDto): void {
    this.validateJourneyCreateData(data);

    if (!data.days || !Array.isArray(data.days) || data.days.length === 0) {
      throw new Error('At least one day is required for the journey');
    }

    data.days.forEach((day, index) => {
      if (!day.date || typeof day.date !== 'string') {
        throw new Error(`Day ${index + 1} must have a valid date`);
      }

      if (day.dayNumber <= 0) {
        throw new Error(`Day ${index + 1} must have a valid day number`);
      }

      if (!day.places || !Array.isArray(day.places)) {
        throw new Error(`Day ${index + 1} must have a places array`);
      }

      day.places.forEach((place, placeIndex) => {
        if (!place.name || typeof place.name !== 'string' || place.name.trim().length === 0) {
          throw new Error(`Day ${index + 1}, Place ${placeIndex + 1} must have a valid name`);
        }

        if (!['STAY', 'ACTIVITY', 'FOOD', 'TRANSPORT', 'NOTE'].includes(place.type)) {
          throw new Error(`Day ${index + 1}, Place ${placeIndex + 1} must have a valid type`);
        }
      });
    });
  }

  /**
   * Validate journey update data
   * Single Responsibility: Separate validation logic
   */
  private validateJourneyUpdateData(data: UpdateJourneyDto): void {
    if (data.title !== undefined) {
      if (typeof data.title !== 'string' || data.title.trim().length === 0) {
        throw new Error('Journey title cannot be empty');
      }
      if (data.title.length > VALIDATION_RULES.JOURNEY.TITLE_MAX_LENGTH) {
        throw new Error(
          ERROR_MESSAGES.VALIDATION.MAX_LENGTH('Journey title', VALIDATION_RULES.JOURNEY.TITLE_MAX_LENGTH)
        );
      }
    }

    if (data.description !== undefined && data.description.length > VALIDATION_RULES.JOURNEY.DESCRIPTION_MAX_LENGTH) {
      throw new Error(
        ERROR_MESSAGES.VALIDATION.MAX_LENGTH('Journey description', VALIDATION_RULES.JOURNEY.DESCRIPTION_MAX_LENGTH)
      );
    }
  }

  /**
   * Extract journeys from response
   * Single Responsibility: Separate data extraction logic
   */
  private extractJourneysFromResponse(data: unknown): Journey[] {
    if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
      return (data as any).data;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      throw new Error('Invalid response format: journeys data not found');
    }
  }

  /**
   * Apply filters to journeys
   * Single Responsibility: Separate filtering logic
   */
  private applyFilters(journeys: Journey[], filters: JourneyFilters): Journey[] {
    let filtered = [...journeys];

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let valueA: unknown, valueB: unknown;

        switch (filters.sortBy) {
          case "title":
            valueA = a.title.toLowerCase();
            valueB = b.title.toLowerCase();
            break;
          case "createdAt":
            valueA = new Date(a.createdAt || 0);
            valueB = new Date(b.createdAt || 0);
            break;
          case "updatedAt":
            valueA = new Date(a.updatedAt || 0);
            valueB = new Date(b.updatedAt || 0);
            break;
          default:
            valueA = a.createdAt || "";
            valueB = b.createdAt || "";
        }

        if (filters.sortOrder === "desc") {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        } else {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        }
      });
    }

    if (filters.offset || filters.limit) {
      const start = filters.offset || 0;
      const end = filters.limit ? start + filters.limit : undefined;
      filtered = filtered.slice(start, end);
    }

    return filtered;
  }

  /**
   * Get most visited location
   * Single Responsibility: Separate calculation logic
   */
  private getMostVisitedLocation(journeys: Journey[]): string | undefined {
    const locationCount: Record<string, number> = {};

    journeys.forEach((journey) => {
      journey.days?.forEach((day) => {
        day.places?.forEach((place) => {
          const location = place.location;
          locationCount[location] = (locationCount[location] || 0) + 1;
        });
      });
    });

    let maxCount = 0;
    let mostVisited: string | undefined;

    Object.entries(locationCount).forEach(([location, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostVisited = location;
      }
    });

    return mostVisited;
  }

  /**
   * Create default banner
   * Single Responsibility: Separate banner creation logic
   */
  private createDefaultBanner(journey: Journey): JourneyBanner {
    return {
      title: journey.title,
      subtitle: journey.description || "An amazing journey awaits",
      description:
        journey.description || "Journey details • Plan your adventure",
      imageUrl:
        journey.coverImage ||
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop",
      gradientColors: {
        from: "#2563eb",
        via: "#9333ea",
        to: "#4338ca",
      },
    };
  }

  /**
   * Create detailed days
   * Single Responsibility: Separate transformation logic
   */
  private createDetailedDays(journey: Journey): DetailedJourneyDay[] {
    if (journey.days && journey.days.length > 0) {
      return journey.days.map((day, index) => ({
        id: `day-${index + 1}`,
        dayNumber: index + 1,
        date:
          day.date ||
          new Date(Date.now() + index * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        activities: this.convertToDetailedActivities(day.places || []),
      }));
    }

    return Array.from({ length: 3 }, (_, index) => ({
      id: `day-${index + 1}`,
      dayNumber: index + 1,
      date: new Date(Date.now() + index * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      activities: {
        placeToStay: [],
        placesToGo: [],
        food: [],
        transport: [],
        notes: [],
      },
    }));
  }

  /**
   * Convert to detailed activities
   * Single Responsibility: Separate conversion logic
   */
  private convertToDetailedActivities(places: any[]): JourneyDayActivities {
    const activities: JourneyDayActivities = {
      placeToStay: [],
      placesToGo: [],
      food: [],
      transport: [],
      notes: [],
    };

    places.forEach((place) => {
      const location: JourneyLocation = {
        id: place.id || `loc-${Date.now()}-${Math.random()}`,
        name: place.name || place.location || "Unknown Place",
        lat: place.lat || 17.385,
        lng: place.lng || 78.4867,
        type: place.type || "placesToGo",
        address: place.address,
        description: place.description,
        rating: place.rating,
        price: place.price,
        images: place.images || [],
      };

      switch (location.type) {
        case "placeToStay":
          activities.placeToStay.push(location);
          break;
        case "food":
          activities.food.push(location);
          break;
        case "transport":
          activities.transport.push(location);
          break;
        default:
          activities.placesToGo.push(location);
      }
    });

    return activities;
  }
}
