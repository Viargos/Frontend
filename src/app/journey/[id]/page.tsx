"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProfileLayout from "@/components/layout/ProfileLayout";
import Button from "@/components/ui/Button";
import {
  BuildingMonumentIcon,
  TreesIcon,
  FoodIcon,
  TransportIcon,
  NotesIcon,
} from "@/components/icons";
import JourneyMap from "@/components/maps/JourneyMap";

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  address?: string;
}

interface JourneyDay {
  id: string;
  dayNumber: number;
  date: string;
  activities: {
    placeToStay: Location[];
    placesToGo: Location[];
    food: Location[];
    transport: Location[];
    notes: Location[];
  };
}

interface BannerData {
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

interface Journey {
  id: string;
  name: string;
  location: string;
  startDate: string;
  days: JourneyDay[];
  banner?: BannerData;
}

export default function JourneyDetailsPage() {
  const params = useParams();
  const journeyId = params.id as string;

  const [journey, setJourney] = useState<Journey | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [isBannerEditModalOpen, setIsBannerEditModalOpen] = useState(false);
  console.log(isBannerEditModalOpen,selectedLocation);
  

  useEffect(() => {
    // Get location data from sessionStorage if available
    const storedLocationData = sessionStorage.getItem("journeyLocationData");
    let journeyLocation = "Hyderabad, India";
    let journeyLocationData = null;

    if (storedLocationData) {
      try {
        journeyLocationData = JSON.parse(storedLocationData);
        journeyLocation = journeyLocationData.name;
        // Don't clear the stored data yet - we need it for the map
      } catch (error) {
        console.error("Error parsing location data:", error);
      }
    }

    // TODO: Fetch journey details from API
    // For now, using mock data
    setJourney({
      id: journeyId,
      name: "Hyderabad Adventure",
      location: journeyLocation,
      startDate: "2024-02-15",
      banner: {
        title: "Hyderabad Adventure",
        subtitle: journeyLocation,
        description: "Journey Details • Plan Your Adventure",
        imageUrl: "",
        gradientColors: {
          from: "#2563eb",
          via: "#9333ea",
          to: "#4338ca",
        },
      },
      days: [
        {
          id: "1",
          dayNumber: 1,
          date: "Saturday 15 Feb",
          activities: {
            placeToStay: [
              {
                id: "1",
                name: "Taj Krishna Hotel",
                lat: 17.385,
                lng: 78.4867,
                type: "placeToStay",
                address: "Road No. 1, Banjara Hills, Hyderabad",
              },
            ],
            placesToGo: [
              {
                id: "2",
                name: "Charminar",
                lat: 17.3616,
                lng: 78.4747,
                type: "placesToGo",
                address: "Charminar, Hyderabad, Telangana",
              },
              {
                id: "3",
                name: "Golconda Fort",
                lat: 17.3833,
                lng: 78.4011,
                type: "placesToGo",
                address: "Golconda, Hyderabad, Telangana",
              },
            ],
            food: [
              {
                id: "4",
                name: "Paradise Biryani",
                lat: 17.385,
                lng: 78.4867,
                type: "food",
                address: "Banjara Hills, Hyderabad",
              },
            ],
            transport: [],
            notes: [],
          },
        },
        {
          id: "2",
          dayNumber: 2,
          date: "Saturday 16 Feb",
          activities: {
            placeToStay: [],
            placesToGo: [],
            food: [],
            transport: [],
            notes: [],
          },
        },
        {
          id: "3",
          dayNumber: 3,
          date: "Saturday 17 Feb",
          activities: {
            placeToStay: [],
            placesToGo: [],
            food: [],
            transport: [],
            notes: [],
          },
        },
      ],
    });
    setIsLoading(false);

    // Cleanup function to clear sessionStorage when component unmounts
    return () => {
      sessionStorage.removeItem("journeyLocationData");
    };
  }, [journeyId]);

  const handleAddActivity = (category: string) => {
    // TODO: Open modal to add activity
    console.log(`Add ${category} for day ${activeDay}`);
  };

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
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

    // Add journey location as the main pin
    const storedLocationData = sessionStorage.getItem("journeyLocationData");
    if (storedLocationData) {
      try {
        const locationData = JSON.parse(storedLocationData);
        allLocations.push({
          id: "journey-location",
          name: locationData.name,
          lat: locationData.lat,
          lng: locationData.lng,
          type: "journeyLocation",
          address: locationData.address,
        });
      } catch (error) {
        console.error("Error parsing location data:", error);
      }
    }

    // Add day-specific activities
    if (currentDay) {
      Object.values(currentDay.activities).forEach((activityList) => {
        allLocations.push(...activityList);
      });
    }

    return allLocations;
  };

  // Get journey center location for map
  const getJourneyCenter = () => {
    const storedLocationData = sessionStorage.getItem("journeyLocationData");
    if (storedLocationData) {
      try {
        const locationData = JSON.parse(storedLocationData);
        return { lat: locationData.lat, lng: locationData.lng };
      } catch (error) {
        console.error("Error parsing location data:", error);
      }
    }
    // Default to Hyderabad if no location data
    return { lat: 17.385, lng: 78.4867 };
  };

  if (isLoading) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProfileLayout>
    );
  }

  if (!journey) {
    return (
      <ProfileLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Journey not found</p>
        </div>
      </ProfileLayout>
    );
  }

  const currentDay = journey.days.find((day) => day.dayNumber === activeDay);

  return (
    <ProfileLayout>
      {/* Banner Section */}
      <div className="relative h-64 w-full mb-6 overflow-hidden rounded-lg group">
        {/* Background with gradient overlay */}
        {journey?.banner?.imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${journey.banner.imageUrl})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom right, ${
                journey?.banner?.gradientColors?.from || "#2563eb"
              }, ${journey?.banner?.gradientColors?.via || "#9333ea"}, ${
                journey?.banner?.gradientColors?.to || "#4338ca"
              })`,
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        )}

        {/* Edit Button */}
        <button
          onClick={() => setIsBannerEditModalOpen(true)}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg backdrop-blur-sm"
        >
          <svg
            className="w-5 h-5"
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
        </button>

        {/* Decorative elements */}
        <div className="absolute top-4 left-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
        </div>

        <div className="absolute bottom-4 left-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <div className="w-3 h-3 bg-white bg-opacity-60 rounded-full"></div>
            <div className="w-3 h-3 bg-white bg-opacity-30 rounded-full"></div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-white opacity-80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">
              {journey?.banner?.title || journey?.name}
            </h1>
            <p className="text-xl opacity-90 mb-1">
              {journey?.banner?.subtitle || journey?.location}
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm opacity-75">
              {journey?.banner?.description ? (
                <span>{journey.banner.description}</span>
              ) : (
                <>
                  <span>•</span>
                  <span>Journey Details</span>
                  <span>•</span>
                  <span>Plan Your Adventure</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-16rem)]">
        {/* Left Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Plan Your Journey
              </h2>
              <p className="text-gray-600 mt-1">
                Organize your activities by day
              </p>
            </div>
            <Button variant="primary">Review & Post</Button>
          </div>

          {/* Day Tabs */}
          <div className="flex space-x-2 mb-6">
            {journey.days.map((day) => (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.dayNumber)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeDay === day.dayNumber
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>

          {/* Day Content */}
          {currentDay && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Day {currentDay.dayNumber} - {currentDay.date}
              </h2>

              {/* Activity Categories */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                <button
                  onClick={() => handleAddActivity("placeToStay")}
                  className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <BuildingMonumentIcon className="w-8 h-8 text-gray-600 mb-2" />
                  <span className="text-sm text-gray-700">Place to stay</span>
                </button>

                <button
                  onClick={() => handleAddActivity("placesToGo")}
                  className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <TreesIcon className="w-8 h-8 text-gray-600 mb-2" />
                  <span className="text-sm text-gray-700">Places to go</span>
                </button>

                <button
                  onClick={() => handleAddActivity("food")}
                  className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <FoodIcon className="w-8 h-8 text-gray-600 mb-2" />
                  <span className="text-sm text-gray-700">Food</span>
                </button>

                <button
                  onClick={() => handleAddActivity("transport")}
                  className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <TransportIcon className="w-8 h-8 text-gray-600 mb-2" />
                  <span className="text-sm text-gray-700">Transport</span>
                </button>

                <button
                  onClick={() => handleAddActivity("notes")}
                  className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <NotesIcon className="w-8 h-8 text-gray-600 mb-2" />
                  <span className="text-sm text-gray-700">Notes</span>
                </button>
              </div>

              {/* Things to do section */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-blue-600 text-xs">~</span>
                    </div>
                    <h3 className="font-medium text-gray-900">Things to do</h3>
                  </div>
                  <button className="text-blue-600 text-sm hover:underline">
                    Add Locations
                  </button>
                </div>
                <p className="text-gray-500 text-sm">
                  Pick a thing to do on your first day in town
                </p>
              </div>

              {/* Add Hotel link */}
              <button className="text-blue-600 text-sm hover:underline mt-4">
                Add Hotel
              </button>
            </div>
          )}
        </div>

        {/* Right Side - Google Maps */}
        <div className="w-1/2 bg-gray-100">
          <JourneyMap
            locations={getCurrentDayLocations()}
            center={getJourneyCenter()}
            onLocationClick={handleLocationClick}
          />
        </div>
      </div>
    </ProfileLayout>
  );
}
