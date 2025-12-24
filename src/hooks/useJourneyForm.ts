import { useState, useCallback } from "react";
import {
  PlaceType,
  CreateJourneyPlace,
  CreateJourneyDay,
  JourneyMediaType,
} from "@/types/journey.types";
import apiClient from "@/lib/api.legacy";
import {
  validateTimeRange,
  compareTimes,
  formatTime,
  addMinutesToTime,
} from "@/utils/time.utils";

export interface JourneyFormData {
  title: string;
  description: string;
  startDate: Date;
  coverImageUrl: string | null;
  coverImageKey: string | null;
  photos: string[];
}

export interface UseJourneyFormReturn {
  // Form data
  formData: JourneyFormData;
  updateFormData: (updates: Partial<JourneyFormData>) => void;

  // Days management
  days: string[];
  activeDay: string;
  setActiveDay: (day: string) => void;
  addDay: () => void;
  deleteDay: (day: string) => void;
  getDateForDay: (dayLabel: string) => string;

  // Places management
  journeyPlaces: { [key: string]: CreateJourneyPlace[] };
  getActiveDayPlaces: () => CreateJourneyPlace[];
  getPlacesByType: (type: PlaceType) => CreateJourneyPlace[];
  addPlaceToActiveDay: (type: PlaceType) => void;
  removePlaceFromActiveDay: (index: number) => void;
  updatePlaceField: (
    index: number,
    field: keyof CreateJourneyPlace,
    value: string | number
  ) => void;
  updatePlacePhotos: (index: number, photos: string[]) => void;
  addPhotoToPlace: (index: number, photoKey: string) => void;
  removePhotoFromPlace: (index: number, photoIndex: number) => void;

  // UI state
  expandedPlaces: { [key: string]: boolean };
  togglePlaceExpansion: (dayKey: string, placeIndex: number) => void;
  isPlaceExpanded: (dayKey: string, placeIndex: number) => boolean;

  // Form submission
  isSubmitting: boolean;
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
  submitJourney: () => Promise<string | null>; // Returns journey ID on success
  submitJourneyWithData: (
    overrideData?: Partial<JourneyFormData>
  ) => Promise<string | null>;
}

export const useJourneyForm = (): UseJourneyFormReturn => {
  // Form data state
  const [formData, setFormData] = useState<JourneyFormData>({
    title: "A Wonderful Trip to Paris",
    description:
      "An exciting 2-day itinerary exploring the best of Paris, from iconic landmarks to charming neighborhoods.",
    startDate: new Date(),
    coverImageUrl: null,
    coverImageKey: null,
    photos: [],
  });

  const [days, setDays] = useState(["Day 1"]);
  const [activeDay, setActiveDay] = useState("Day 1");
  const [journeyPlaces, setJourneyPlaces] = useState<{
    [key: string]: CreateJourneyPlace[];
  }>({
    "Day 1": [],
  });
  const [expandedPlaces, setExpandedPlaces] = useState<{
    [key: string]: boolean;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateFormData = useCallback((updates: Partial<JourneyFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const addDay = useCallback(() => {
    const newDayNumber = days.length + 1;
    const newDayLabel = `Day ${newDayNumber}`;

    setDays((prev) => [...prev, newDayLabel]);
    setJourneyPlaces((prev) => ({
      ...prev,
      [newDayLabel]: [],
    }));
    setActiveDay(newDayLabel);
  }, [days.length]);

  const deleteDay = useCallback(
    (dayToDelete: string) => {
      if (days.length <= 1) return;

      const updatedDays = days.filter((day) => day !== dayToDelete);
      const reorderedDays = updatedDays.map((_, index) => `Day ${index + 1}`);

      setDays(reorderedDays);

      setJourneyPlaces((prev) => {
        const newPlaces: { [key: string]: CreateJourneyPlace[] } = {};
        let currentIndex = 0;

        updatedDays.forEach((oldDay) => {
          if (oldDay !== dayToDelete) {
            const newDayKey = `Day ${currentIndex + 1}`;
            newPlaces[newDayKey] = prev[oldDay] || [];
            currentIndex++;
          }
        });

        return newPlaces;
      });

      if (activeDay === dayToDelete) {
        setActiveDay("Day 1");
      } else {
        const oldActiveIndex = days.indexOf(activeDay);
        const deletedIndex = days.indexOf(dayToDelete);

        if (oldActiveIndex > deletedIndex) {
          const newActiveIndex = oldActiveIndex - 1;
          setActiveDay(`Day ${newActiveIndex + 1}`);
        }
      }
    },
    [days, activeDay]
  );

  const getDateForDay = useCallback(
    (dayLabel: string): string => {
      const dayNumber = parseInt(dayLabel.split(" ")[1]) - 1;
      const targetDate = new Date(formData.startDate);
      targetDate.setDate(formData.startDate.getDate() + dayNumber);

      return targetDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    },
    [formData.startDate]
  );

  const getActiveDayPlaces = useCallback(() => {
    return journeyPlaces[activeDay] || [];
  }, [journeyPlaces, activeDay]);

  const getPlacesByType = useCallback(
    (type: PlaceType) => {
      return getActiveDayPlaces().filter((place) => place.type === type);
    },
    [getActiveDayPlaces]
  );

  const getPlaceholderName = (type: PlaceType): string => {
    switch (type) {
      case PlaceType.STAY:
        return "New Hotel";
      case PlaceType.ACTIVITY:
        return "New Activity";
      case PlaceType.FOOD:
        return "New Restaurant";
      case PlaceType.TRANSPORT:
        return "New Transport";
      case PlaceType.NOTE:
        return "New Note";
      default:
        return "New Place";
    }
  };

  // Calculate time based on index (starting at 09:00)
  const calculateTimeForIndex = (index: number): { startTime: string; endTime: string } => {
    const baseHour = 9; // Start at 09:00
    const startHour = baseHour + index;
    const endHour = startHour + 1;
    
    const formatTime = (hour: number): string => {
      return `${hour.toString().padStart(2, '0')}:00`;
    };
    
    return {
      startTime: formatTime(startHour),
      endTime: formatTime(endHour),
    };
  };

  const addPlaceToActiveDay = useCallback(
    (type: PlaceType) => {
      if (type === PlaceType.NOTE) {
        const existingPlaces = journeyPlaces[activeDay] || [];
        const hasExistingNote = existingPlaces.some(
          (place) => place.type === PlaceType.NOTE
        );

        if (hasExistingNote) {
          return;
        }
      }

      const existingPlaces = journeyPlaces[activeDay] || [];
      const newIndex = existingPlaces.length;
      
      // Default behavior: Activity[0] keeps its own time, Activity[i] auto-sets
      let startTime: string;
      let endTime: string;
      
      if (newIndex === 0) {
        // Activity[0] keeps its own time (calculated based on index)
        const calculated = calculateTimeForIndex(newIndex);
        startTime = calculated.startTime;
        endTime = calculated.endTime;
      } else if (newIndex > 0 && existingPlaces[newIndex - 1].endTime) {
        // Activity[i]: startTime = activity[i-1].endTime (no gap)
        const previousEndTime = existingPlaces[newIndex - 1].endTime;
        startTime = previousEndTime;
        // endTime = startTime + 1 hour (default duration)
        endTime = addMinutesToTime(startTime, 60);
      } else {
        // Fallback: calculate based on index
        const calculated = calculateTimeForIndex(newIndex);
        startTime = calculated.startTime;
        endTime = calculated.endTime;
      }

      const newPlace: CreateJourneyPlace = {
        name: getPlaceholderName(type),
        description: "",
        type: type,
        startTime: startTime,
        endTime: endTime,
        latitude: 0,
        longitude: 0,
        address: "",
        photos: [],
        // New places haven't been manually edited yet
        hasManualStart: false,
        hasManualEnd: false,
      };

      setJourneyPlaces((prev) => ({
        ...prev,
        [activeDay]: [...(prev[activeDay] || []), newPlace],
      }));
    },
    [activeDay, journeyPlaces]
  );

  const removePlaceFromActiveDay = useCallback(
    (index: number) => {
      setJourneyPlaces((prev) => {
        const currentPlaces = prev[activeDay] || [];
        const updatedPlaces = currentPlaces.filter((_, i) => i !== index);
        
        // Preserve time linking: link each place's start time to previous end time
        // ONLY if it hasn't been manually edited
        const placesWithLinkedTimes = updatedPlaces.map((place, newIndex) => {
          let startTime = place.startTime;
          let endTime = place.endTime;
          
          // Link start time to previous activity's end time (no gap)
          // ONLY if start time hasn't been manually edited
          if (newIndex > 0 && updatedPlaces[newIndex - 1].endTime && !place.hasManualStart) {
            const previousEndTime = updatedPlaces[newIndex - 1].endTime;
            startTime = previousEndTime; // No gap - start exactly when previous ends
            // If end time also not manually edited, set to startTime + 1 hour
            if (!place.hasManualEnd) {
              endTime = addMinutesToTime(startTime, 60);
            }
          } else if (!startTime) {
            // Fallback: calculate if no previous end time
            const calculated = calculateTimeForIndex(newIndex);
            startTime = calculated.startTime;
          }
          
          // Ensure end time exists and is valid
          if (!endTime || (startTime && !validateTimeRange(startTime, endTime))) {
            if (startTime && !place.hasManualEnd) {
              // Default: endTime = startTime + 1 hour
              endTime = addMinutesToTime(startTime, 60);
            } else {
              const calculated = calculateTimeForIndex(newIndex);
              endTime = calculated.endTime;
            }
          }
          
          return {
            ...place,
            startTime,
            endTime,
            // Preserve manual edit flags
            hasManualStart: place.hasManualStart || false,
            hasManualEnd: place.hasManualEnd || false,
          };
        });
        
        return {
          ...prev,
          [activeDay]: placesWithLinkedTimes,
        };
      });
    },
    [activeDay]
  );

  const updatePlaceField = useCallback(
    (
      index: number,
      field: keyof CreateJourneyPlace,
      value: string | number
    ) => {
      const isTimeField = field === 'startTime' || field === 'endTime';
      const isStartTime = field === 'startTime';
      const isEndTime = field === 'endTime';

      setJourneyPlaces((prev) => {
        const currentPlaces = prev[activeDay] || [];
        const currentPlace = currentPlaces[index];
        
        if (!currentPlace) return prev;

        // Format time value if it's a time field
        // For HTML5 time inputs, the value is already in HH:mm format, so we can use it directly
        const formattedValue = isTimeField && typeof value === 'string' 
          ? value.trim() // Just trim, don't reformat (HTML5 time inputs already provide correct format)
          : value;

        // Always allow the update - validation is for display purposes only
        // Users should be able to type any time and fix it later
        const updatedPlace: CreateJourneyPlace = {
          ...currentPlace,
          [field]: formattedValue,
        };

        // Mark time fields as manually edited when user changes them
        if (isStartTime) {
          updatedPlace.hasManualStart = true;
        } else if (isEndTime) {
          updatedPlace.hasManualEnd = true;
        }

        const updatedPlaces = currentPlaces.map((place, i) =>
          i === index ? updatedPlace : place
        );

        // Manual update behavior: cascade times when end time is edited
        if (isEndTime && typeof formattedValue === 'string') {
          // When user manually changes end time of activity i:
          // - Update start time of activity i+1 to match this new end time
          // - Update end time of activity i+1 to startTime + 1 hour
          // - Continue cascading only for activities that have not been manually edited
          
          let currentEndTime = formattedValue;
          let cascadeIndex = index + 1;
          
          // Cascade through all subsequent activities that haven't been manually edited
          while (cascadeIndex < updatedPlaces.length) {
            const nextPlace = updatedPlaces[cascadeIndex];
            
            // Stop cascading if start time is manually edited (can't update it)
            if (nextPlace.hasManualStart) {
              break;
            }
            
            // startTime[i+1] = endTime[i] (match the new end time)
            const newStartTime = currentEndTime;
            
            // Update end time if not manually edited
            if (!nextPlace.hasManualEnd) {
              // endTime[i+1] = startTime + 1 hour (default duration)
              const newEndTime = addMinutesToTime(newStartTime, 60);
              
              // Validate the time range
              if (validateTimeRange(newStartTime, newEndTime)) {
                updatedPlaces[cascadeIndex] = {
                  ...nextPlace,
                  startTime: newStartTime,
                  endTime: newEndTime,
                  // Preserve manual edit flags
                  hasManualStart: nextPlace.hasManualStart || false,
                  hasManualEnd: nextPlace.hasManualEnd || false,
                };
                // Update currentEndTime for next iteration
                currentEndTime = newEndTime;
                cascadeIndex++;
              } else {
                // Invalid range, stop cascading
                break;
              }
            } else {
              // End time is manually edited, only update start time
              const nextEndTime = nextPlace.endTime || '';
              if (!nextEndTime || validateTimeRange(newStartTime, nextEndTime)) {
                updatedPlaces[cascadeIndex] = {
                  ...nextPlace,
                  startTime: newStartTime,
                  // Preserve manual edit flags
                  hasManualStart: nextPlace.hasManualStart || false,
                  hasManualEnd: nextPlace.hasManualEnd || false,
                };
                // Continue cascading with the manual end time
                currentEndTime = nextEndTime;
                cascadeIndex++;
              } else {
                // Invalid range, stop cascading
                break;
              }
            }
          }
        }
        // When start time is updated, we DON'T update previous activity's end time
        // (as per requirements: "make sure it does NOT break the previous activity's end time")
        // Validation is already done above

        return {
          ...prev,
          [activeDay]: updatedPlaces,
        };
      });
    },
    [activeDay]
  );

  const updatePlacePhotos = useCallback(
    (index: number, photos: string[]) => {
      setJourneyPlaces((prev) => ({
        ...prev,
        [activeDay]: (prev[activeDay] || []).map((place, i) =>
          i === index ? { ...place, photos } : place
        ),
      }));
    },
    [activeDay]
  );

  const addPhotoToPlace = useCallback(
    (index: number, photoKey: string) => {
      setJourneyPlaces((prev) => {
        const currentPlaces = prev[activeDay] || [];
        const updatedPlaces = currentPlaces.map((place, i) =>
          i === index
            ? { ...place, photos: [...(place.photos || []), photoKey] }
            : place
        );

        const updatedPhotos =
          (updatedPlaces[index] && updatedPlaces[index].photos) || [];
        console.log("Images state after upload (place photos):", {
          dayKey: activeDay,
          placeIndex: index,
          photos: updatedPhotos,
        });

        return {
          ...prev,
          [activeDay]: updatedPlaces,
        };
      });
    },
    [activeDay]
  );

  const removePhotoFromPlace = useCallback(
    (index: number, photoIndex: number) => {
      setJourneyPlaces((prev) => ({
        ...prev,
        [activeDay]: (prev[activeDay] || []).map((place, i) =>
          i === index
            ? {
                ...place,
                photos: (place.photos || []).filter(
                  (_, pIndex) => pIndex !== photoIndex
                ),
              }
            : place
        ),
      }));
    },
    [activeDay]
  );

  const togglePlaceExpansion = useCallback(
    (dayKey: string, placeIndex: number) => {
      const key = `${dayKey}-${placeIndex}`;
      setExpandedPlaces((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    },
    []
  );

  const isPlaceExpanded = useCallback(
    (dayKey: string, placeIndex: number) => {
      const key = `${dayKey}-${placeIndex}`;
      return expandedPlaces[key] || false;
    },
    [expandedPlaces]
  );

  const submitJourneyWithData = useCallback(
    async (overrideData?: Partial<JourneyFormData>): Promise<string | null> => {
      setIsSubmitting(true);
      setErrorMessage(null);

      // Use override data if provided, otherwise use current form data
      const dataToUse = { ...formData, ...overrideData };

      try {
        const token = localStorage.getItem("viargos_auth_token");
        console.log("Token in localStorage:", token ? "EXISTS" : "MISSING");

        const journeyDays: CreateJourneyDay[] = days.map((dayLabel, index) => {
          const dayNumber = parseInt(dayLabel.split(" ")[1]);
          const dayDate = new Date(dataToUse.startDate);
          dayDate.setDate(dataToUse.startDate.getDate() + index);

          const dayPlaces = (journeyPlaces[dayLabel] || []).filter(
            (place) => place.type !== PlaceType.NOTE
          );
          const notePlace = (journeyPlaces[dayLabel] || []).find(
            (place) => place.type === PlaceType.NOTE
          );
          const dayNotes = notePlace ? notePlace.description || "" : "";

          return {
            dayNumber: dayNumber - 1,
            date: dayDate.toISOString(),
            notes: dayNotes,
            places: dayPlaces.map((place, placeIndex) => {
              const photoKeys = place.photos || [];
              const media =
                Array.isArray(photoKeys) && photoKeys.length > 0
                  ? photoKeys.map((photoKey, mediaIndex) => ({
                      // Use shared enum that matches backend: IMAGE = 'image'
                      type: JourneyMediaType.IMAGE,
                      url: photoKey,
                      order: mediaIndex,
                    }))
                  : [];

              console.log("[PLACE_MEDIA_CHECK]", {
                dayNumber,
                placeIndex,
                placeName: place.name,
                photoCount: photoKeys.length,
                mediaCount: media.length,
              });

              const placePayload: any = {
                type: place.type,
                name: place.name,
                description: place.description || "",
                startTime: place.startTime || "",
                endTime: place.endTime || "",
                address: place.address || "",
                latitude: place.latitude || null,
                longitude: place.longitude || null,
              };

              if (media.length > 0) {
                placePayload.media = media;
              }

              // Defensive: ensure we never send legacy photos/images fields
              delete (placePayload as any).photos;
              delete (placePayload as any).images;

              return placePayload;
            }),
          };
        });

        const journeyData = {
          title: dataToUse.title,
          description: dataToUse.description,
          coverImage: dataToUse.coverImageUrl,
          days: journeyDays,
        };

        console.log(
          "[CREATE_JOURNEY_PAYLOAD]",
          JSON.stringify(journeyData, null, 2)
        );
        const hasAnyMedia = journeyDays.some((day) =>
          day.places.some(
            (place: any) =>
              Array.isArray(place.media) && place.media.length > 0
          )
        );
        console.log("Any media present in payload:", hasAnyMedia);
        const response = await apiClient.createJourney(journeyData as any);
        console.log("Full API Response:", response);
        console.log("Response structure:", {
          hasData: !!response?.data,
          statusCode: response?.statusCode,
          message: response?.message,
          dataKeys: response?.data ? Object.keys(response.data) : null,
          dataId: response?.data?.id,
        });

        if (
          !response ||
          (!response.data &&
            response.statusCode !== 200 &&
            response.statusCode !== 201)
        ) {
          console.error("Response validation failed:", {
            response,
            hasData: !!response?.data,
            statusCode: response?.statusCode,
          });
          throw new Error(response?.message || "Failed to create journey");
        }

        // Try different ways to extract the journey ID
        let journeyId: string | null = null;

        if (response.data?.id) {
          journeyId = response.data.id;
        } else if (response.id) {
          // Sometimes the ID might be directly on the response
          journeyId = response.id;
        } else if (typeof response.data === "string") {
          // Sometimes the ID might be returned as a string
          journeyId = response.data;
        } else if (response.data && typeof response.data === "object") {
          // Look for any ID-like properties
          const possibleIdFields = ["id", "_id", "journeyId", "journey_id"];
          for (const field of possibleIdFields) {
            if (response.data[field]) {
              journeyId = response.data[field];
              break;
            }
          }
        }

        if (!journeyId) {
          console.error("Journey ID validation failed:", {
            hasData: !!response.data,
            dataId: response?.data?.id,
            responseId: response?.id,
            fullData: response?.data,
            fullResponse: response,
          });
          throw new Error("No journey ID found in server response");
        }

        console.log("Journey created successfully:", response.data);
        console.log("Returning journey ID:", journeyId);
        return journeyId;
      } catch (error: any) {
        console.error("Failed to create journey:", error);

        // Handle authentication errors specifically
        // if (
        //   error.isAuthError ||
        //   error.statusCode === 10001 ||
        //   error?.response?.status === 401
        // ) {
        //   const authErrorMessage =
        //     "Your session has expired. Please refresh the page and log in again.";
        //   setErrorMessage(authErrorMessage);

        //   // Optionally redirect to login or refresh page
        //   setTimeout(() => {
        //     window.location.reload();
        //   }, 3000);

        //   return null;
        // }

        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "An error occurred while creating your journey. Please try again.";
        setErrorMessage(errorMessage);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, days, journeyPlaces]
  );

  const submitJourney = useCallback(async (): Promise<string | null> => {
    return submitJourneyWithData();
  }, [submitJourneyWithData]);

  return {
    formData,
    updateFormData,
    days,
    activeDay,
    setActiveDay,
    addDay,
    deleteDay,
    getDateForDay,
    journeyPlaces,
    getActiveDayPlaces,
    getPlacesByType,
    addPlaceToActiveDay,
    removePlaceFromActiveDay,
    updatePlaceField,
    updatePlacePhotos,
    addPhotoToPlace,
    removePhotoFromPlace,
    expandedPlaces,
    togglePlaceExpansion,
    isPlaceExpanded,
    isSubmitting,
    errorMessage,
    setErrorMessage,
    submitJourney,
    submitJourneyWithData,
  };
};
