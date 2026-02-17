import { useState, useCallback, useEffect } from "react";
import { PlaceType, JourneyMediaType } from "@/enums";
import {
  CreateJourneyPlace,
  CreateJourneyDay,
  Journey,
  UpdateJourneyDto,
} from "@/types/journey.types";
import { JourneyApi } from "@/lib/api";
import {
  validateTimeRange,
  addMinutesToTime,
} from "@/utils/time.utils";

export interface EditJourneyFormData {
  title: string;
  description: string;
  startDate: Date;
  coverImageUrl: string | null;
  coverImageKey: string | null;
  photos: string[];
}

export interface UseEditJourneyFormReturn {
  // Loading state
  isLoadingJourney: boolean;
  loadError: string | null;
  journeyLoaded: boolean;

  // Form data
  formData: EditJourneyFormData;
  updateFormData: (updates: Partial<EditJourneyFormData>) => void;

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
  submitUpdate: () => Promise<boolean>;
  submitUpdateWithData: (
    overrideData?: Partial<EditJourneyFormData>
  ) => Promise<boolean>;
}

export const useEditJourneyForm = (journeyId: string): UseEditJourneyFormReturn => {
  // Loading state
  const [isLoadingJourney, setIsLoadingJourney] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [journeyLoaded, setJourneyLoaded] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<EditJourneyFormData>({
    title: "",
    description: "",
    startDate: new Date(),
    coverImageUrl: null,
    coverImageKey: null,
    photos: [],
  });

  const [days, setDays] = useState<string[]>([]);
  const [activeDay, setActiveDay] = useState("");
  const [journeyPlaces, setJourneyPlaces] = useState<{
    [key: string]: CreateJourneyPlace[];
  }>({});
  const [expandedPlaces, setExpandedPlaces] = useState<{
    [key: string]: boolean;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to get image URL from S3 key
  const getImageUrl = (photoKey: string): string => {
    if (photoKey.startsWith('http')) {
      return photoKey;
    }
    return `https://viargos-sandbox.s3.us-east-2.amazonaws.com/${photoKey}`;
  };

  // Helper to extract S3 key from URL or return key as-is
  const extractS3Key = (urlOrKey: string | null | undefined): string | null => {
    if (!urlOrKey) return null;
    // If it's already a full URL, extract just the key part
    const s3Prefix = 'https://viargos-sandbox.s3.us-east-2.amazonaws.com/';
    if (urlOrKey.startsWith(s3Prefix)) {
      return urlOrKey.replace(s3Prefix, '');
    }
    // If it starts with http but different domain, return as-is (external image)
    if (urlOrKey.startsWith('http')) {
      return urlOrKey;
    }
    // It's already just a key
    return urlOrKey;
  };

  // Load journey data on mount
  useEffect(() => {
    const loadJourney = async () => {
      if (!journeyId) {
        setLoadError("No journey ID provided");
        setIsLoadingJourney(false);
        return;
      }

      try {
        setIsLoadingJourney(true);
        setLoadError(null);

        const response = await JourneyApi.getById(journeyId);
        const journey = response; // API already extracts .data

        if (!journey) {
          throw new Error("Journey not found");
        }

        console.log("[EDIT_JOURNEY] Loaded journey:", journey);

        // Transform journey data to form data
        const startDate = journey.days && journey.days.length > 0
          ? new Date(journey.days[0].date)
          : new Date();

        // Extract the S3 key from the cover image (in case it's stored as full URL)
        const coverKey = extractS3Key(journey.coverImage);
        
        setFormData({
          title: journey.title || "",
          description: journey.description || "",
          startDate,
          coverImageUrl: coverKey ? getImageUrl(coverKey) : null,
          coverImageKey: coverKey,
          photos: [],
        });
        
        console.log("[EDIT_JOURNEY] Cover image:", {
          original: journey.coverImage,
          extractedKey: coverKey,
          fullUrl: coverKey ? getImageUrl(coverKey) : null,
        });

        // Transform days
        if (journey.days && journey.days.length > 0) {
          const dayLabels = journey.days.map((_, index) => `Day ${index + 1}`);
          setDays(dayLabels);
          setActiveDay(dayLabels[0]);

          // Transform places for each day
          const placesMap: { [key: string]: CreateJourneyPlace[] } = {};
          
          journey.days.forEach((day, dayIndex) => {
            const dayLabel = `Day ${dayIndex + 1}`;
            const places: CreateJourneyPlace[] = [];

            // Add regular places
            if (day.places) {
              day.places.forEach((place) => {
                // Extract photos from media
                const photos: string[] = [];
                if (place.media && Array.isArray(place.media)) {
                  place.media.forEach((m) => {
                    if (m.type === 'image' || m.type === 'IMAGE') {
                      photos.push(m.url);
                    }
                  });
                }

                places.push({
                  type: place.type as PlaceType,
                  name: place.name,
                  description: place.description || "",
                  startTime: place.startTime || "",
                  endTime: place.endTime || "",
                  address: place.address || "",
                  latitude: place.latitude ? parseFloat(String(place.latitude)) : undefined,
                  longitude: place.longitude ? parseFloat(String(place.longitude)) : undefined,
                  photos,
                  hasManualStart: true, // Preserve existing times
                  hasManualEnd: true,
                });
              });
            }

            // Add notes as a NOTE type place if exists
            if (day.notes) {
              places.push({
                type: PlaceType.NOTE,
                name: "Notes",
                description: day.notes,
                photos: [],
              });
            }

            placesMap[dayLabel] = places;
          });

          setJourneyPlaces(placesMap);
        } else {
          // Initialize with at least one day
          setDays(["Day 1"]);
          setActiveDay("Day 1");
          setJourneyPlaces({ "Day 1": [] });
        }

        setJourneyLoaded(true);
      } catch (error) {
        console.error("[EDIT_JOURNEY] Failed to load journey:", error);
        setLoadError(error instanceof Error ? error.message : "Failed to load journey");
      } finally {
        setIsLoadingJourney(false);
      }
    };

    loadJourney();
  }, [journeyId]);

  const updateFormData = useCallback((updates: Partial<EditJourneyFormData>) => {
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

        days.forEach((oldDay) => {
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
        return "Add a Hotel / Stay";
      case PlaceType.ACTIVITY:
        return "Add a place";
      case PlaceType.FOOD:
        return 'Add a restaurant / food';
      case PlaceType.TRANSPORT:
        return "Add a transportation mode";
      case PlaceType.NOTE:
        return "Add a note";
      default:
        return "Add a place";
    }
  };

  const calculateTimeForIndex = (index: number): { startTime: string; endTime: string } => {
    const baseHour = 9;
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

      let startTime: string;
      let endTime: string;

      if (newIndex === 0) {
        const calculated = calculateTimeForIndex(newIndex);
        startTime = calculated.startTime;
        endTime = calculated.endTime;
      } else if (newIndex > 0 && existingPlaces[newIndex - 1].endTime) {
        const previousEndTime = existingPlaces[newIndex - 1].endTime;
        startTime = previousEndTime;
        endTime = addMinutesToTime(startTime, 60);
      } else {
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

        const placesWithLinkedTimes = updatedPlaces.map((place, newIndex) => {
          let startTime = place.startTime;
          let endTime = place.endTime;

          if (newIndex > 0 && updatedPlaces[newIndex - 1].endTime && !place.hasManualStart) {
            const previousEndTime = updatedPlaces[newIndex - 1].endTime;
            startTime = previousEndTime;
            if (!place.hasManualEnd) {
              endTime = addMinutesToTime(startTime, 60);
            }
          } else if (!startTime) {
            const calculated = calculateTimeForIndex(newIndex);
            startTime = calculated.startTime;
          }

          if (!endTime || (startTime && !validateTimeRange(startTime, endTime))) {
            if (startTime && !place.hasManualEnd) {
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

        const formattedValue = isTimeField && typeof value === 'string'
          ? value.trim()
          : value;

        const updatedPlace: CreateJourneyPlace = {
          ...currentPlace,
          [field]: formattedValue,
        };

        if (isStartTime) {
          updatedPlace.hasManualStart = true;
        } else if (isEndTime) {
          updatedPlace.hasManualEnd = true;
        }

        const updatedPlaces = currentPlaces.map((place, i) =>
          i === index ? updatedPlace : place
        );

        if (isEndTime && typeof formattedValue === 'string') {
          let currentEndTime = formattedValue;
          let cascadeIndex = index + 1;

          while (cascadeIndex < updatedPlaces.length) {
            const nextPlace = updatedPlaces[cascadeIndex];

            if (nextPlace.hasManualStart) {
              break;
            }

            const newStartTime = currentEndTime;

            if (!nextPlace.hasManualEnd) {
              const newEndTime = addMinutesToTime(newStartTime, 60);

              if (validateTimeRange(newStartTime, newEndTime)) {
                updatedPlaces[cascadeIndex] = {
                  ...nextPlace,
                  startTime: newStartTime,
                  endTime: newEndTime,
                  hasManualStart: nextPlace.hasManualStart || false,
                  hasManualEnd: nextPlace.hasManualEnd || false,
                };
                currentEndTime = newEndTime;
                cascadeIndex++;
              } else {
                break;
              }
            } else {
              const nextEndTime = nextPlace.endTime || '';
              if (!nextEndTime || validateTimeRange(newStartTime, nextEndTime)) {
                updatedPlaces[cascadeIndex] = {
                  ...nextPlace,
                  startTime: newStartTime,
                  hasManualStart: nextPlace.hasManualStart || false,
                  hasManualEnd: nextPlace.hasManualEnd || false,
                };
                currentEndTime = nextEndTime;
                cascadeIndex++;
              } else {
                break;
              }
            }
          }
        }

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

  const submitUpdateWithData = useCallback(
    async (overrideData?: Partial<EditJourneyFormData>): Promise<boolean> => {
      setIsSubmitting(true);
      setErrorMessage(null);

      const dataToUse = { ...formData, ...overrideData };

      try {
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
                      type: JourneyMediaType.IMAGE,
                      url: photoKey,
                      order: mediaIndex,
                    }))
                  : [];

              console.log("[EDIT_PLACE_MEDIA_CHECK]", {
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

              delete (placePayload as any).photos;
              delete (placePayload as any).images;

              return placePayload;
            }),
          };
        });

        // Ensure we save the S3 key, not the full URL
        const coverImageToSave = extractS3Key(dataToUse.coverImageKey) || extractS3Key(dataToUse.coverImageUrl);
        
        const updateData: UpdateJourneyDto = {
          title: dataToUse.title,
          description: dataToUse.description,
          coverImage: coverImageToSave,
          days: journeyDays,
        };
        
        console.log("[UPDATE_JOURNEY] Cover image to save:", coverImageToSave);

        console.log(
          "[UPDATE_JOURNEY_PAYLOAD]",
          JSON.stringify(updateData, null, 2)
        );

        const updateResponse = await JourneyApi.updateJourney(journeyId, updateData);
        console.log("Journey updated successfully:", updateResponse.data);
        return true;
      } catch (error: any) {
        console.error("Failed to update journey:", error);

        // Extract meaningful error message
        let errorMsg = "An error occurred while updating your journey. Please try again.";
        
        if (error?.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error?.message) {
          // Don't show generic "Success" or technical messages
          const message = error.message;
          if (message && message !== "Success" && !message.includes("column")) {
            errorMsg = message;
          }
        }
        
        setErrorMessage(`Failed to update journey: ${errorMsg}`);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, days, journeyPlaces, journeyId]
  );

  const submitUpdate = useCallback(async (): Promise<boolean> => {
    return submitUpdateWithData();
  }, [submitUpdateWithData]);

  return {
    isLoadingJourney,
    loadError,
    journeyLoaded,
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
    submitUpdate,
    submitUpdateWithData,
  };
};
