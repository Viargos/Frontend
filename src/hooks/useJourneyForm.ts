import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { PlaceType, JourneyMediaType } from "@/enums";
import {
  CreateJourneyPlace,
  CreateJourneyDay,
} from "@/types/journey.types";
import { JourneyApi } from "@/lib/api";
import { recalculateDayTimeline } from "@/utils/journeyTimeline.helper";

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
  /**
   * Add a place to the active day
   * @param type - Type of place to add
   * @param initialData - Optional initial data for the place (e.g., coordinates from map click)
   * @returns UUID of new place, or undefined if NOTE already exists
   */
  addPlaceToActiveDay: (
    type: PlaceType,
    initialData?: Partial<CreateJourneyPlace>
  ) => string | undefined;
  removePlaceFromActiveDay: (index: number) => void;
  reorderPlaces: (dayKey: string, oldIndex: number, newIndex: number) => void;
  updatePlaceField: (
    index: number,
    field: keyof CreateJourneyPlace,
    value: string | number
  ) => void;
  updatePlacePhotos: (index: number, photos: string[]) => void;
  addPhotoToPlace: (index: number, photoKey: string) => void;
  removePhotoFromPlace: (index: number, photoIndex: number) => void;

  // UI state (key = place.id for stable identity across reorder)
  expandedPlaces: { [placeId: string]: boolean };
  togglePlaceExpansion: (placeId: string) => void;
  isPlaceExpanded: (placeId: string) => boolean;

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

  const addPlaceToActiveDay = useCallback(
    (
      type: PlaceType,
      initialData?: Partial<CreateJourneyPlace>
    ): string | undefined => {
      if (type === PlaceType.NOTE) {
        const existingPlaces = journeyPlaces[activeDay] || [];
        const hasExistingNote = existingPlaces.some(
          (place) => place.type === PlaceType.NOTE
        );
        if (hasExistingNote) return undefined;
      }

      const newId = uuidv4();
      const newPlace: CreateJourneyPlace = {
        id: newId,
        name: getPlaceholderName(type),
        description: "",
        type: type,
        startTime: "09:00",
        endTime: "10:00",
        latitude: 0,
        longitude: 0,
        address: "",
        photos: [],
        hasManualStart: false,
        hasManualEnd: false,
        ...initialData, // ✅ Merge initial data (e.g., coordinates from map click)
      };

      setJourneyPlaces((prev) => {
        const updatedPlaces = [...(prev[activeDay] || []), newPlace];
        const recalculated = recalculateDayTimeline(updatedPlaces);
        return {
          ...prev,
          [activeDay]: recalculated,
        };
      });
      return newId;
    },
    [activeDay, journeyPlaces]
  );

  const removePlaceFromActiveDay = useCallback(
    (index: number) => {
      setJourneyPlaces((prev) => {
        const currentPlaces = prev[activeDay] || [];
        const updatedPlaces = currentPlaces.filter((_, i) => i !== index);
        const recalculated = recalculateDayTimeline(updatedPlaces);
        return {
          ...prev,
          [activeDay]: recalculated,
        };
      });
    },
    [activeDay]
  );

  const reorderPlaces = useCallback(
    (dayKey: string, oldIndex: number, newIndex: number) => {
      setJourneyPlaces((prev) => {
        const dayPlaces = prev[dayKey] ? [...prev[dayKey]] : [];
        if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0 || oldIndex >= dayPlaces.length || newIndex >= dayPlaces.length) {
          return prev;
        }
        const [moved] = dayPlaces.splice(oldIndex, 1);
        dayPlaces.splice(newIndex, 0, moved);
        const recalculated = recalculateDayTimeline(dayPlaces);
        return { ...prev, [dayKey]: recalculated };
      });
    },
    []
  );

  const updatePlaceField = useCallback(
    (
      index: number,
      field: keyof CreateJourneyPlace,
      value: string | number
    ) => {
      if (field === 'latitude' || field === 'longitude') {
        console.log(`📍 useJourneyForm: Updating ${field} for place ${index}:`, value);
      }

      const isTimeField = field === 'startTime' || field === 'endTime';
      const formattedValue =
        isTimeField && typeof value === 'string' ? value.trim() : value;

      setJourneyPlaces((prev) => {
        const currentPlaces = prev[activeDay] || [];
        const currentPlace = currentPlaces[index];
        if (!currentPlace) return prev;

        const updatedPlace: CreateJourneyPlace = {
          ...currentPlace,
          [field]: formattedValue,
        };
        if (field === 'startTime') updatedPlace.hasManualStart = true;
        if (field === 'endTime') updatedPlace.hasManualEnd = true;

        const updatedPlaces = currentPlaces.map((place, i) =>
          i === index ? updatedPlace : place
        );
        const recalculated = isTimeField
          ? recalculateDayTimeline(updatedPlaces)
          : updatedPlaces;

        if (field === 'latitude' || field === 'longitude') {
          console.log('📍 useJourneyForm: Updated place:', {
            index,
            name: updatedPlace.name,
            latitude: updatedPlace.latitude,
            longitude: updatedPlace.longitude,
          });
        }

        return {
          ...prev,
          [activeDay]: recalculated,
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

  const togglePlaceExpansion = useCallback((placeId: string) => {
    setExpandedPlaces((prev) => ({
      ...prev,
      [placeId]: !prev[placeId],
    }));
  }, []);

  const isPlaceExpanded = useCallback(
    (placeId: string) => expandedPlaces[placeId] ?? false,
    [expandedPlaces]
  );

  const submitJourneyWithData = useCallback(
    async (overrideData?: Partial<JourneyFormData>): Promise<string | null> => {
      setIsSubmitting(true);
      setErrorMessage(null);

      // Use override data if provided, otherwise use current form data
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
                order: placeIndex, // ✅ Preserve drag-and-drop order
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

        // Helper to extract S3 key from URL
        const extractS3Key = (urlOrKey: string | null): string | null => {
          if (!urlOrKey) return null;
          const s3Prefix = 'https://viargos-sandbox.s3.us-east-2.amazonaws.com/';
          if (urlOrKey.startsWith(s3Prefix)) {
            return urlOrKey.replace(s3Prefix, '');
          }
          return urlOrKey;
        };
        
        // Use the S3 key if available, otherwise extract from URL
        const coverImageToSave = dataToUse.coverImageKey || extractS3Key(dataToUse.coverImageUrl);
        
        const journeyData = {
          title: dataToUse.title,
          description: dataToUse.description,
          coverImage: coverImageToSave,
          days: journeyDays,
        };
        
        console.log("[CREATE_JOURNEY] Cover image to save:", coverImageToSave);

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
        const response = await JourneyApi.createJourney(journeyData as any);
        const journey = response; // API already extracts .data
        console.log("Journey created successfully:", journey);

        const journeyId = journey?.id;
        if (!journeyId) {
          throw new Error("No journey ID found in server response");
        }
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
    reorderPlaces,
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
