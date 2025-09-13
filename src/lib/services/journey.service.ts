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

export class JourneyService implements IJourneyService {
  async getMyJourneys(filters?: JourneyFilters): Promise<Journey[]> {
    try {
      const response = await apiClient.getMyJourneys();
      // Handle double-wrapped response structure
      // Check if we have the expected success response (10000 indicates success from API client)
      if (response.statusCode !== 10000 && response.statusCode !== 200) {
        throw new Error(response.message || "Failed to fetch journeys");
      }

      if (!response.data) {
        throw new Error("No data received from server");
      }

      // Extract the actual journey data from nested structure
      let journeys;
      if (response.data.data && Array.isArray(response.data.data)) {
        // Double-wrapped: response.data.data contains the journeys
        journeys = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Single-wrapped: response.data contains the journeys
        journeys = response.data;
      } else {
        throw new Error("Invalid response format: journeys data not found");
      }

      // Apply client-side filters if provided
      if (filters) {
        journeys = this.applyFilters(journeys, filters);
      }

      return journeys;
    } catch (error: any) {
      // Don't re-wrap errors that are already Error instances from our own code
      if (error instanceof Error) {
        throw error;
      }
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch my journeys";
      throw new Error(errorMessage);
    }
  }

  async getAllJourneys(filters?: JourneyFilters): Promise<Journey[]> {
    try {
      const response = await apiClient.getAllJourneys();

      if (response.statusCode !== 200) {
        throw new Error(response.message || "Failed to fetch public journeys");
      }

      if (!response.data) {
        throw new Error("No data received from server");
      }

      let journeys = response.data;

      // Apply client-side filters if provided
      if (filters) {
        journeys = this.applyFilters(journeys, filters);
      }

      return journeys;
    } catch (error: any) {
      // Don't re-wrap errors that are already Error instances from our own code
      if (error instanceof Error) {
        throw error;
      }
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch public journeys";
      throw new Error(errorMessage);
    }
  }

  async getJourneyById(id: string): Promise<Journey> {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Valid journey ID is required");
      }

      const response = await apiClient.getJourney(id);

      if (response.statusCode !== 10000 || !response.data) {
        throw new Error(response.message || "Failed to fetch journey");
      }

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch journey details";
      throw new Error(errorMessage);
    }
  }

  async createJourney(data: CreateJourneyDto): Promise<Journey> {
    try {
      // Validate input data
      if (
        !data.title ||
        typeof data.title !== "string" ||
        data.title.trim().length === 0
      ) {
        throw new Error("Journey title is required");
      }

      if (data.title.length > 100) {
        throw new Error("Journey title cannot exceed 100 characters");
      }

      if (data.description && data.description.length > 500) {
        throw new Error("Journey description cannot exceed 500 characters");
      }

      const journeyData = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
      };

      const response = await apiClient.createJourney(journeyData);

      if (response.statusCode !== 201 && response.statusCode !== 200) {
        throw new Error(response.message || "Failed to create journey");
      }

      if (!response.data) {
        throw new Error("No journey data returned from server");
      }

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create journey";
      throw new Error(errorMessage);
    }
  }

  async createComprehensiveJourney(
    data: CreateComprehensiveJourneyDto
  ): Promise<Journey> {
    try {
      // Validate input data
      if (
        !data.title ||
        typeof data.title !== "string" ||
        data.title.trim().length === 0
      ) {
        throw new Error("Journey title is required");
      }

      if (data.title.length > 100) {
        throw new Error("Journey title cannot exceed 100 characters");
      }

      if (data.description && data.description.length > 500) {
        throw new Error("Journey description cannot exceed 500 characters");
      }

      if (!data.days || !Array.isArray(data.days) || data.days.length === 0) {
        throw new Error("At least one day is required for the journey");
      }

      // Validate each day
      data.days.forEach((day, index) => {
        if (!day.date || typeof day.date !== "string") {
          throw new Error(`Day ${index + 1} must have a valid date`);
        }

        if (day.dayNumber <= 0) {
          throw new Error(`Day ${index + 1} must have a valid day number`);
        }

        if (!day.places || !Array.isArray(day.places)) {
          throw new Error(`Day ${index + 1} must have a places array`);
        }

        // Validate each place
        day.places.forEach((place, placeIndex) => {
          if (
            !place.name ||
            typeof place.name !== "string" ||
            place.name.trim().length === 0
          ) {
            throw new Error(
              `Day ${index + 1}, Place ${placeIndex + 1} must have a valid name`
            );
          }

          if (
            !Object.values([
              "STAY",
              "ACTIVITY",
              "FOOD",
              "TRANSPORT",
              "NOTE",
            ]).includes(place.type)
          ) {
            throw new Error(
              `Day ${index + 1}, Place ${placeIndex + 1} must have a valid type`
            );
          }
        });
      });

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
        throw new Error(
          response.message || "Failed to create comprehensive journey"
        );
      }

      if (!response.data) {
        throw new Error("No journey data returned from server");
      }

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create comprehensive journey";
      throw new Error(errorMessage);
    }
  }

  async updateJourney(id: string, data: UpdateJourneyDto): Promise<Journey> {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Valid journey ID is required");
      }

      // Validate update data
      if (data.title !== undefined) {
        if (typeof data.title !== "string" || data.title.trim().length === 0) {
          throw new Error("Journey title cannot be empty");
        }
        if (data.title.length > 100) {
          throw new Error("Journey title cannot exceed 100 characters");
        }
      }

      if (data.description !== undefined && data.description.length > 500) {
        throw new Error("Journey description cannot exceed 500 characters");
      }

      const updateData = {
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.description !== undefined && {
          description: data.description.trim() || null,
        }),
      };

      const response = await apiClient.updateJourney(id, updateData);

      if (response.statusCode !== 200 || !response.data) {
        throw new Error(response.message || "Failed to update journey");
      }

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update journey";
      throw new Error(errorMessage);
    }
  }

  async deleteJourney(id: string): Promise<void> {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Valid journey ID is required");
      }

      const response = await apiClient.deleteJourney(id);

      if (response.statusCode !== 200 && response.statusCode !== 204) {
        throw new Error(response.message || "Failed to delete journey");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete journey";
      throw new Error(errorMessage);
    }
  }

  async getJourneyStats(userId?: string): Promise<JourneyStats> {
    try {
      const journeys = userId
        ? await this.getAllJourneys() // In a real app, we'd have a getUserJourneys method
        : await this.getMyJourneys();

      const stats: JourneyStats = {
        totalJourneys: journeys.length,
        publishedJourneys: journeys.length, // Assuming all returned journeys are published
        draftJourneys: 0, // Would need status field on Journey interface
        archivedJourneys: 0, // Would need status field on Journey interface
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

      return stats;
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to fetch journey statistics";
      throw new Error(errorMessage);
    }
  }

  async searchJourneys(
    query: string,
    filters?: JourneyFilters
  ): Promise<Journey[]> {
    try {
      if (!query || typeof query !== "string") {
        throw new Error("Search query is required");
      }

      // For now, we'll search through all journeys client-side
      // In a production app, this would be server-side search
      const allJourneys = await this.getAllJourneys(filters);

      const searchTerm = query.toLowerCase().trim();
      const filteredJourneys = allJourneys.filter(
        (journey) =>
          journey.title.toLowerCase().includes(searchTerm) ||
          journey.description?.toLowerCase().includes(searchTerm) ||
          journey.user.username.toLowerCase().includes(searchTerm)
      );

      return filteredJourneys;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to search journeys";
      throw new Error(errorMessage);
    }
  }

  async shareJourney(
    id: string,
    shareData: { isPublic: boolean }
  ): Promise<void> {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Valid journey ID is required");
      }

      // This would be implemented based on your API
      // For now, we'll simulate with an update call
      await this.updateJourney(id, {
        // In a real implementation, we'd have a `isPublic` field
        description: shareData.isPublic ? "Public journey" : "Private journey",
      });
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to share journey";
      throw new Error(errorMessage);
    }
  }

  async duplicateJourney(id: string, newTitle?: string): Promise<Journey> {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Valid journey ID is required");
      }

      const originalJourney = await this.getJourneyById(id);
      const duplicatedTitle = newTitle || `${originalJourney.title} (Copy)`;

      const createData: CreateJourneyDto = {
        title: duplicatedTitle,
        description: originalJourney.description,
      };

      return await this.createJourney(createData);
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to duplicate journey";
      throw new Error(errorMessage);
    }
  }

  // Detailed Journey operations
  async getDetailedJourney(id: string): Promise<DetailedJourney> {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Valid journey ID is required");
      }

      // For now, we'll create a mock detailed journey based on the basic journey
      // In a real implementation, this would be a separate API endpoint
      const basicJourney = await this.getJourneyById(id);

      // Convert to detailed journey with mock data
      const detailedJourney: DetailedJourney = {
        ...basicJourney,
        banner: this.createDefaultBanner(basicJourney),
        days: this.createDetailedDays(basicJourney),
        totalBudget: 1500,
        currency: "USD",
        isPublic: false,
        tags: ["adventure", "cultural", "food"],
        difficulty: "moderate",
        duration: 72, // 3 days in hours
        distance: 50, // km
        transportation: ["car", "walking"],
        bestTimeToVisit: "Oct-Mar",
        language: "English",
      };

      return detailedJourney;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch detailed journey";
      throw new Error(errorMessage);
    }
  }

  async updateJourneyBanner(
    id: string,
    banner: JourneyBanner
  ): Promise<DetailedJourney> {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Valid journey ID is required");
      }

      // In a real implementation, this would update the banner on the server
      const detailedJourney = await this.getDetailedJourney(id);
      return {
        ...detailedJourney,
        banner,
      };
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update journey banner";
      throw new Error(errorMessage);
    }
  }

  async addDayToJourney(
    id: string,
    day: { date: string }
  ): Promise<DetailedJourney> {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Valid journey ID is required");
      }

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

      return {
        ...detailedJourney,
        days: [...detailedJourney.days, newDay],
      };
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to add day to journey";
      throw new Error(errorMessage);
    }
  }

  async removeDayFromJourney(
    id: string,
    dayId: string
  ): Promise<DetailedJourney> {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Valid journey ID is required");
      }

      const detailedJourney = await this.getDetailedJourney(id);
      const updatedDays = detailedJourney.days.filter(
        (day) => day.id !== dayId
      );

      // Renumber days
      updatedDays.forEach((day, index) => {
        day.dayNumber = index + 1;
      });

      return {
        ...detailedJourney,
        days: updatedDays,
      };
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to remove day from journey";
      throw new Error(errorMessage);
    }
  }

  // Activity management
  async addActivityToDay(
    journeyId: string,
    data: AddActivityData
  ): Promise<JourneyLocation> {
    try {
      if (!journeyId || typeof journeyId !== "string") {
        throw new Error("Valid journey ID is required");
      }

      const newLocation: JourneyLocation = {
        id: `location-${Date.now()}`,
        type: data.category,
        ...data.location,
      };

      // In a real implementation, this would save to the server
      return newLocation;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to add activity";
      throw new Error(errorMessage);
    }
  }

  async updateActivity(
    journeyId: string,
    data: UpdateActivityData
  ): Promise<JourneyLocation> {
    try {
      if (!journeyId || typeof journeyId !== "string") {
        throw new Error("Valid journey ID is required");
      }

      // Mock implementation - in reality, this would update the server
      const updatedLocation: JourneyLocation = {
        id: data.locationId,
        name: data.updates.name || "Updated Location",
        lat: data.updates.lat || 0,
        lng: data.updates.lng || 0,
        type: data.updates.type || "placesToGo",
        ...data.updates,
      };

      return updatedLocation;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update activity";
      throw new Error(errorMessage);
    }
  }

  async removeActivity(journeyId: string, locationId: string): Promise<void> {
    try {
      if (!journeyId || typeof journeyId !== "string") {
        throw new Error("Valid journey ID is required");
      }
      if (!locationId || typeof locationId !== "string") {
        throw new Error("Valid location ID is required");
      }

      // In a real implementation, this would delete from the server
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to remove activity";
      throw new Error(errorMessage);
    }
  }

  async reorderActivities(
    journeyId: string,
    dayId: string,
    locationIds: string[]
  ): Promise<void> {
    try {
      if (!journeyId || typeof journeyId !== "string") {
        throw new Error("Valid journey ID is required");
      }
      if (!dayId || typeof dayId !== "string") {
        throw new Error("Valid day ID is required");
      }

      // In a real implementation, this would reorder activities on the server
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to reorder activities";
      throw new Error(errorMessage);
    }
  }

  // Location services
  async searchLocations(
    query: string,
    center?: { lat: number; lng: number }
  ): Promise<JourneyLocation[]> {
    try {
      if (!query || typeof query !== "string") {
        throw new Error("Search query is required");
      }

      // Mock location search - in reality, this would use Google Places API or similar
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

      return mockLocations;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to search locations";
      throw new Error(errorMessage);
    }
  }

  async getLocationDetails(locationId: string): Promise<JourneyLocation> {
    try {
      if (!locationId || typeof locationId !== "string") {
        throw new Error("Valid location ID is required");
      }

      // Mock location details
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

      return mockLocation;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch location details";
      throw new Error(errorMessage);
    }
  }

  // Private helper methods
  private applyFilters(
    journeys: Journey[],
    filters: JourneyFilters
  ): Journey[] {
    let filtered = [...journeys];

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let valueA: any, valueB: any;

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

    // Apply pagination
    if (filters.offset || filters.limit) {
      const start = filters.offset || 0;
      const end = filters.limit ? start + filters.limit : undefined;
      filtered = filtered.slice(start, end);
    }

    return filtered;
  }

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

  private createDefaultBanner(journey: Journey): JourneyBanner {
    return {
      id: "banner-1",
      title: journey.title,
      subtitle: journey.description || "An amazing journey awaits",
      imageUrl:
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop",
      overlayOpacity: 0.4,
      textPosition: "center",
      textColor: "#ffffff",
    };
  }

  private createDetailedDays(journey: Journey): DetailedJourneyDay[] {
    // If the journey already has days, convert them to detailed format
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

    // Create default 3-day structure
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

      // Categorize based on type or default to placesToGo
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
