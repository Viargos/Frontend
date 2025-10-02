"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import JourneyMap from "@/components/maps/JourneyMap";
import { serviceFactory } from "@/lib/services/service-factory";
import { Journey } from "@/types/journey.types";
import { format } from "date-fns";

interface Location {
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: string;
    address?: string;
}

export default function JourneyDetailsPage() {
    const params = useParams();
    const journeyId = params.id as string;

    const [journey, setJourney] = useState<Journey | null>(null);
    const [activeDay, setActiveDay] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(
        null
    );
    const [isBannerEditModalOpen, setIsBannerEditModalOpen] = useState(false);
    console.log(isBannerEditModalOpen, selectedLocation);

    useEffect(() => {
        const fetchJourney = async () => {
            try {
                setIsLoading(true);
                setError(null);

                console.log("Fetching journey with ID:", journeyId);
                console.log("Journey ID type:", typeof journeyId);
                console.log("Journey ID length:", journeyId?.length);

                if (!journeyId) {
                    throw new Error("No journey ID provided");
                }

                const journeyService = serviceFactory.journeyService;
                console.log("Journey service initialized:", !!journeyService);

                const fetchedJourney = await journeyService.getJourneyById(
                    journeyId
                );

                console.log("Fetched journey:", fetchedJourney);
                console.log("Journey data structure:", {
                    hasTitle: !!fetchedJourney?.title,
                    hasDescription: !!fetchedJourney?.description,
                    hasDays: !!fetchedJourney?.days,
                    daysCount: fetchedJourney?.days?.length || 0,
                    hasUser: !!fetchedJourney?.user,
                    hasCoverImage: !!fetchedJourney?.coverImage,
                    coverImageUrl: fetchedJourney?.coverImage,
                });

                setJourney(fetchedJourney);

                // Set active day to 1 if there are days, or the first available day
                if (fetchedJourney.days && fetchedJourney.days.length > 0) {
                    setActiveDay(fetchedJourney.days[0].dayNumber);
                }
            } catch (error) {
                console.error("Error fetching journey:", error);
                console.error("Error details:", {
                    message:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                    stack:
                        error instanceof Error ? error.stack : "No stack trace",
                    errorType: typeof error,
                    errorObject: error,
                });
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load journey"
                );
            } finally {
                setIsLoading(false);
            }
        };

        if (journeyId) {
            fetchJourney();
        } else {
            console.error("No journey ID found in URL params");
            setError("Invalid journey URL - no ID provided");
            setIsLoading(false);
        }
    }, [journeyId]);

    const handleLocationClick = (location: Location) => {
        setSelectedLocation(location);
    };

    // Helper function to format date properly
    const formatDayDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, "EEEE, MMMM d, yyyy"); // e.g., "Saturday, October 2, 2025"
        } catch (error) {
            console.error("Error formatting date:", error);
            return dateString; // fallback to original string if formatting fails
        }
    };

    // Helper function to organize places by type
    const getPlacesByType = (day: any) => {
        const places = day?.places || [];
        const organized = {
            placeToStay: [] as Location[],
            placesToGo: [] as Location[],
            food: [] as Location[],
            transport: [] as Location[],
            notes: [] as Location[],
        };

        places.forEach((place: any) => {
            const location: Location = {
                id: place.id,
                name: place.name,
                lat: place.latitude ? parseFloat(place.latitude) : 0,
                lng: place.longitude ? parseFloat(place.longitude) : 0,
                type: place.type,
                address: place.address || place.description,
            };

            switch (place.type) {
                case "STAY":
                    organized.placeToStay.push(location);
                    break;
                case "ACTIVITY":
                    organized.placesToGo.push(location);
                    break;
                case "FOOD":
                    organized.food.push(location);
                    break;
                case "TRANSPORT":
                    organized.transport.push(location);
                    break;
                case "NOTE":
                    organized.notes.push(location);
                    break;
                default:
                    organized.placesToGo.push(location);
            }
        });

        return organized;
    };

    // const handleBannerSave = (bannerData: BannerData) => {
    //   if (journey) {
    //     setJourney({
    //       ...journey,
    //       banner: bannerData,
    //     });
    //   }
    // };

    // Get all locations for the current day
    const getCurrentDayLocations = (): Location[] => {
        const allLocations: Location[] = [];

        // Add day-specific activities
        if (currentDay) {
            const organizedPlaces = getPlacesByType(currentDay);
            Object.values(organizedPlaces).forEach((activityList) => {
                allLocations.push(...activityList);
            });
        }

        return allLocations;
    };

    // Get journey center location for map
    const getJourneyCenter = () => {
        // If we have locations from the current day, center on the first one
        const locations = getCurrentDayLocations();
        if (
            locations.length > 0 &&
            locations[0].lat !== 0 &&
            locations[0].lng !== 0
        ) {
            return { lat: locations[0].lat, lng: locations[0].lng };
        }

        // If we have any locations with valid coordinates, use the first one
        if (journey?.days) {
            for (const day of journey.days) {
                const organizedPlaces = getPlacesByType(day);
                const allPlaces = Object.values(organizedPlaces).flat();
                const validLocation = allPlaces.find(
                    (loc) => loc.lat !== 0 && loc.lng !== 0
                );
                if (validLocation) {
                    return { lat: validLocation.lat, lng: validLocation.lng };
                }
            }
        }

        // Default to Montreal based on the sample data
        return { lat: 45.5017, lng: -73.5673 }; // Montreal as default
    };

    if (isLoading) {
        return (
            <div className="flex-1 bg-gray-50 p-4 sm:p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading journey...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 bg-gray-50 p-4 sm:p-6">
                <div className="text-center py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                        <div className="text-red-600 mb-2">
                            <svg
                                className="w-8 h-8 mx-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-red-800 mb-2">
                            Failed to load journey
                        </h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!journey) {
        return (
            <div className="flex-1 bg-gray-50 p-4 sm:p-6">
                <div className="text-center py-8">
                    <p className="text-gray-500">Journey not found</p>
                </div>
            </div>
        );
    }

    const currentDay = journey.days?.find((day) => day.dayNumber === activeDay);

    return (
        <div className="flex-1 bg-gray-50 p-4 sm:p-6 max-w-none">
            {/* Banner Section */}
            <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 w-full mb-4 sm:mb-6 overflow-hidden rounded-lg group">
                {/* Background Image */}
                <Image
                    src={journey?.coverImage || "/london.png"}
                    alt="Journey cover"
                    fill
                    className="object-cover"
                    style={{ zIndex: 1 }}
                    priority
                    onLoad={() => {
                        console.log(
                            "Cover image loaded successfully:",
                            journey?.coverImage
                        );
                    }}
                    onError={() => {
                        console.error(
                            "Cover image failed to load:",
                            journey?.coverImage
                        );
                    }}
                />

                {/* Black Overlay */}
                <div
                    className="absolute inset-0 bg-black/40"
                    style={{ zIndex: 2 }}
                ></div>

                {/* Edit Button */}
                <button
                    onClick={() => setIsBannerEditModalOpen(true)}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/20 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-white/30 flex items-center gap-1 sm:gap-2"
                >
                    <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                    </svg>
                    <span className="hidden sm:inline">Edit</span>
                </button>

                {/* Journey Name and Subtitle Overlay */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                    style={{ zIndex: 3 }}
                >
                    {/* Journey Name */}
                    <div className="w-full max-w-4xl mb-2">
                        <h1
                            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white"
                            style={{
                                textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                            }}
                        >
                            {journey?.title || "Journey"}
                        </h1>
                    </div>

                    {/* Subtitle/Description */}
                    <div className="w-full max-w-xl">
                        <p
                            className="text-sm sm:text-base lg:text-lg text-white/90"
                            style={{
                                textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
                            }}
                        >
                            {journey?.description || "Explore amazing places"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-h-[calc(100vh-16rem)]">
                {/* Left Content */}
                <div className="lg:col-span-2 bg-white rounded-lg p-4 sm:p-6 overflow-y-auto shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
                        <div>
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                                Journey Details
                            </h2>
                        </div>
                    </div>

                    {/* Day Tabs */}
                    {journey.days && journey.days.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                            {journey.days.map((day) => (
                                <button
                                    key={day.id}
                                    onClick={() => setActiveDay(day.dayNumber)}
                                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                                        activeDay === day.dayNumber
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm"
                                    }`}
                                >
                                    Day {day.dayNumber + 1}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 sm:mb-6">
                            <p className="text-yellow-800">
                                This journey doesn&apos;t have any days planned
                                yet.
                            </p>
                        </div>
                    )}

                    {/* Day Content */}
                    {currentDay && (
                        <div>
                            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">
                                Day {currentDay.dayNumber + 1} -{" "}
                                {formatDayDate(currentDay.date)}
                            </h2>

                            {/* Timeline Display */}
                            {currentDay &&
                            currentDay.places &&
                            currentDay.places.length > 0 ? (
                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                                    <div className="space-y-6">
                                        {/* All places combined in timeline format */}
                                        {[
                                            ...getPlacesByType(currentDay)
                                                .placeToStay,
                                            ...getPlacesByType(currentDay)
                                                .placesToGo,
                                            ...getPlacesByType(currentDay).food,
                                            ...getPlacesByType(currentDay)
                                                .transport,
                                        ].map((place, index) => (
                                            <div
                                                key={place.id}
                                                className="relative flex items-start"
                                            >
                                                {/* Timeline Dot */}
                                                <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white border-2 border-blue-600 rounded-full flex-shrink-0">
                                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                        {place.type ===
                                                            "STAY" && (
                                                            <span className="text-white text-xs">
                                                                🏨
                                                            </span>
                                                        )}
                                                        {place.type ===
                                                            "ACTIVITY" && (
                                                            <span className="text-white text-xs">
                                                                📍
                                                            </span>
                                                        )}
                                                        {place.type ===
                                                            "FOOD" && (
                                                            <span className="text-white text-xs">
                                                                🍽️
                                                            </span>
                                                        )}
                                                        {place.type ===
                                                            "TRANSPORT" && (
                                                            <span className="text-white text-xs">
                                                                🚗
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Timeline Content */}
                                                <div className="ml-6 flex-1">
                                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex">
                                                            {/* Image placeholder */}
                                                            <div className="w-24 h-20 sm:w-32 sm:h-24 bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                                                                    {place.type ===
                                                                        "STAY" && (
                                                                        <span className="text-white text-xs">
                                                                            🏨
                                                                        </span>
                                                                    )}
                                                                    {place.type ===
                                                                        "ACTIVITY" && (
                                                                        <span className="text-white text-xs">
                                                                            📍
                                                                        </span>
                                                                    )}
                                                                    {place.type ===
                                                                        "FOOD" && (
                                                                        <span className="text-white text-xs">
                                                                            🍽️
                                                                        </span>
                                                                    )}
                                                                    {place.type ===
                                                                        "TRANSPORT" && (
                                                                        <span className="text-white text-xs">
                                                                            🚗
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Content */}
                                                            <div className="flex-1 p-4">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1 min-w-0">
                                                                        <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
                                                                            {
                                                                                place.name
                                                                            }
                                                                        </h3>
                                                                        <div className="flex items-center text-sm text-gray-600 mb-2">
                                                                            <svg
                                                                                className="w-4 h-4 mr-1 text-gray-400"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={
                                                                                        2
                                                                                    }
                                                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                                                />
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={
                                                                                        2
                                                                                    }
                                                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                                                />
                                                                            </svg>
                                                                            <span className="truncate">
                                                                                {place.type ===
                                                                                    "STAY" &&
                                                                                    "Accommodation & Theme Parks"}
                                                                                {place.type ===
                                                                                    "ACTIVITY" &&
                                                                                    "Attractions & Activities"}
                                                                                {place.type ===
                                                                                    "FOOD" &&
                                                                                    "Restaurants & Dining"}
                                                                                {place.type ===
                                                                                    "TRANSPORT" &&
                                                                                    "Transportation"}
                                                                            </span>
                                                                        </div>
                                                                        {place.address && (
                                                                            <p className="text-sm text-gray-500 line-clamp-2">
                                                                                {
                                                                                    place.address
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    {/* View Images button */}
                                                                    <button
                                                                        onClick={() =>
                                                                            handleLocationClick(
                                                                                place
                                                                            )
                                                                        }
                                                                        className="ml-4 flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors flex-shrink-0"
                                                                    >
                                                                        <svg
                                                                            className="w-4 h-4 mr-1"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={
                                                                                    2
                                                                                }
                                                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                            />
                                                                        </svg>
                                                                        View
                                                                        Images
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Notes in timeline */}
                                        {currentDay.notes && (
                                            <div className="relative flex items-start">
                                                {/* Timeline Dot for Notes */}
                                                <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white border-2 border-yellow-500 rounded-full flex-shrink-0">
                                                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs">
                                                            📝
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Notes Content */}
                                                <div className="ml-6 flex-1">
                                                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                                        <div className="flex items-start">
                                                            <div className="text-yellow-600 mr-2">
                                                                📝
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-yellow-800 mb-1">
                                                                    Notes
                                                                </h4>
                                                                <p className="text-sm text-yellow-700">
                                                                    {
                                                                        currentDay.notes
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-blue-600 text-xl">
                                            📍
                                        </span>
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-1">
                                        No places added yet
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-4">
                                        Start planning your day by adding places
                                        to visit, restaurants, or
                                        accommodations.
                                    </p>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                                        Add Your First Place
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side - Google Maps */}
                <div className="lg:col-span-1 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                    <div className="h-[400px] sm:h-[500px] lg:h-full">
                        <JourneyMap
                            locations={getCurrentDayLocations()}
                            center={getJourneyCenter()}
                            onLocationClick={handleLocationClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
