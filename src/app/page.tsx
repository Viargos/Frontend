"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import Header from "@/components/home/Header";
import ModalContainer from "@/components/auth/ModalContainer";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import GuestPostsList from "@/components/post/GuestPostsList";
import Loader from "@/components/common/Loader";
import DayFilter from "@/components/journey/DayFilter";
import PlanningCategory from "@/components/journey/PlanningCategory";
import PlaceToStayIcon from "@/components/icons/PlaceToStayIcon";
import { TreesIcon } from "@/components/icons/TreesIcon";
import { FoodIcon } from "@/components/icons/FoodIcon";
import { TransportIcon } from "@/components/icons/TransportIcon";
import { NotesIcon } from "@/components/icons/NotesIcon";
import { PlaceType, CreateJourneyPlace } from "@/types/journey.types";
import JourneyMap from "@/components/maps/JourneyMap";
import { PlaceCard } from "@/components/journey/PlaceCard";
import "@/lib/scroll-utils"; // Import scroll reset utility
import Lottie from "lottie-react";
import planeAnimation from "@/lib/animation/plane.json";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";

export default function Home() {
    const { user, isAuthenticated, openSignup, openLogin } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [showContent, setShowContent] = useState(false);
    const { location: currentLocation } = useCurrentLocation();

    // Sample Journey Data
    const [sampleDays] = useState(["Day 1", "Day 2", "Day 3"]);
    const [activeDay, setActiveDay] = useState("Day 1");
    const [expandedPlaces, setExpandedPlaces] = useState<{
        [key: string]: boolean;
    }>({});

    // Sample places data for demonstration
    const samplePlaces: { [key: string]: CreateJourneyPlace[] } = {
        "Day 1": [
            {
                type: PlaceType.STAY,
                name: "Hotel Paris Central",
                description:
                    "Luxury hotel in the heart of Paris with amazing views of the Eiffel Tower",
                startTime: "15:00",
                endTime: "11:00",
                address: "123 Rue de Rivoli, Paris, France",
                latitude: 48.8566,
                longitude: 2.3522,
                photos: [],
            },
            {
                type: PlaceType.ACTIVITY,
                name: "Eiffel Tower",
                description:
                    "Visit the iconic Eiffel Tower and enjoy panoramic views of Paris",
                startTime: "09:00",
                endTime: "12:00",
                address: "Champ de Mars, Paris, France",
                latitude: 48.8584,
                longitude: 2.2945,
                photos: [],
            },
            {
                type: PlaceType.FOOD,
                name: "Le Comptoir du Relais",
                description:
                    "Traditional French bistro with authentic Parisian atmosphere",
                startTime: "19:00",
                endTime: "21:30",
                address: "9 Carrefour de l'Odéon, Paris, France",
                latitude: 48.8509,
                longitude: 2.3364,
                photos: [],
            },
        ],
        "Day 2": [
            {
                type: PlaceType.ACTIVITY,
                name: "Louvre Museum",
                description:
                    "Explore the world's largest art museum and see the Mona Lisa",
                startTime: "10:00",
                endTime: "16:00",
                address: "Rue de Rivoli, Paris, France",
                latitude: 48.8606,
                longitude: 2.3376,
                photos: [],
            },
            {
                type: PlaceType.TRANSPORT,
                name: "Metro Line 1",
                description: "Take the metro from Louvre to Champs-Élysées",
                startTime: "16:30",
                endTime: "17:00",
                address: "Paris Metro System",
                latitude: 48.8566,
                longitude: 2.3522,
                photos: [],
            },
            {
                type: PlaceType.FOOD,
                name: "Ladurée Champs-Élysées",
                description: "Famous patisserie for authentic French macarons",
                startTime: "17:30",
                endTime: "18:30",
                address: "75 Avenue des Champs-Élysées, Paris, France",
                latitude: 48.8698,
                longitude: 2.3074,
                photos: [],
            },
        ],
        "Day 3": [
            {
                type: PlaceType.ACTIVITY,
                name: "Montmartre & Sacré-Cœur",
                description:
                    "Explore the artistic district and visit the beautiful basilica",
                startTime: "09:00",
                endTime: "14:00",
                address: "Montmartre, Paris, France",
                latitude: 48.8867,
                longitude: 2.3431,
                photos: [],
            },
            {
                type: PlaceType.NOTE,
                name: "Travel Tips",
                description:
                    "Remember to bring comfortable walking shoes. Best time to visit is early morning to avoid crowds. Don't forget your camera!",
                startTime: "08:00",
                endTime: "08:00",
                address: "",
                latitude: 0,
                longitude: 0,
                photos: [],
            },
        ],
    };

    const getActiveDayPlaces = () => {
        return samplePlaces[activeDay] || [];
    };

    const togglePlaceExpansion = (dayKey: string, placeIndex: number) => {
        const key = `${dayKey}-${placeIndex}`;
        setExpandedPlaces((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const isPlaceExpanded = (dayKey: string, placeIndex: number) => {
        const key = `${dayKey}-${placeIndex}`;
        return expandedPlaces[key] || false;
    };

    // Get map locations from active day places
    const getMapLocations = () => {
        const locations: Array<{
            id: string;
            name: string;
            lat: number;
            lng: number;
            type: string;
            address?: string;
            day?: string;
        }> = [];

        const activeDayPlaces = getActiveDayPlaces();
        activeDayPlaces.forEach((place, index) => {
            if (
                place.latitude &&
                place.longitude &&
                place.latitude !== 0 &&
                place.longitude !== 0
            ) {
                locations.push({
                    id: `${activeDay}-${index}`,
                    name: place.name,
                    lat: place.latitude,
                    lng: place.longitude,
                    type: place.type.toLowerCase(),
                    address: place.address || undefined,
                    day: activeDay,
                });
            }
        });

        return locations;
    };

    // Get map center based on current places or current location
    const getMapCenter = () => {
        const activePlaces = getActiveDayPlaces();

        const placeWithCoords = activePlaces.find(
            (place) =>
                place.latitude &&
                place.longitude &&
                place.latitude !== 0 &&
                place.longitude !== 0
        );

        if (placeWithCoords) {
            return {
                lat: placeWithCoords.latitude!,
                lng: placeWithCoords.longitude!,
            };
        }

        // Use current location if available
        if (currentLocation) {
            return {
                lat: currentLocation.latitude,
                lng: currentLocation.longitude,
            };
        }

        // Fallback to world center if no location available
        return { lat: 20.0, lng: 0.0 };
    };

    const getDateForDay = (day: string) => {
        const dayNumber = parseInt(day.split(" ")[1]);
        const baseDate = new Date("2024-06-15");
        baseDate.setDate(baseDate.getDate() + dayNumber - 1);
        return baseDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Simulate loading and setup initial animations
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
            // Delay content appearance for smoother transition
            setTimeout(() => {
                setShowContent(true);
            }, 200);
        }, 1500); // Show loading for 1.5 seconds

        return () => clearTimeout(timer);
    }, []);

    // Redirect authenticated users to dashboard
    useEffect(() => {
        if (isAuthenticated && user) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, user, router]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: [0.6, -0.05, 0.01, 0.99],
            },
        },
    };

    const heroVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.6, -0.05, 0.01, 0.99],
            },
        },
    };

    const buttonVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
        hover: {
            scale: 1.05,
            transition: {
                duration: 0.2,
            },
        },
        tap: {
            scale: 0.95,
        },
    };

    return (
        <ErrorBoundary>
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <Loader key="loading" />
                ) : (
                    <motion.div
                        key="content"
                        className="min-h-screen bg-gray-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Top Header */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="w-full bg-white border-b border-gray-200 px-4"
                        >
                            <div className="max-w-7xl mx-auto">
                                <Header user={user} />
                            </div>
                        </motion.div>

                        {/* Hero Section - Full Width */}
                        <motion.div
                            variants={heroVariants }
                            className="relative overflow-hidden min-h-[700px] sm:min-h-[800px] w-full"
                        >
                            {/* Plane Animation Background */}
                            <div className="absolute inset-0 z-0">
                                <Lottie
                                    animationData={planeAnimation}
                                    loop={true}
                                    autoplay={true}
                                    className="w-full h-[65%] object-cover opacity-20"
                                />
                            </div>

                            <div
                                style={{
                                    backgroundImage: "url(/hero.svg)",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                }}
                                className="relative z-10 text-center flex flex-col justify-start items-center min-h-[700px] sm:min-h-[800px] px-4 max-w-7xl mx-auto w-full pt-8 sm:pt-12"
                            >
                                <motion.h1
                                    className="text-3xl sm:text-6xl font-bold text-gray-900 mb-6"
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate={showContent ? "visible" : "hidden"}
                                >
                                    Welcome to{" "}
                                    <span className="text-blue-600">
                                        Viargos
                                    </span>
                                </motion.h1>

                                <motion.p
                                    className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed"
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate={showContent ? "visible" : "hidden"}
                                >
                                    The ultimate travel companion for planning
                                    journeys, sharing experiences, and
                                    discovering amazing destinations with a
                                    global community of travelers.
                                </motion.p>

                                <motion.div
                                    className="flex flex-row gap-3 sm:gap-4 justify-center items-center"
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate={showContent ? "visible" : "hidden"}
                                >
                                    <motion.button
                                        onClick={openSignup}
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        className="px-4 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-sm sm:text-lg shadow-lg cursor-pointer"
                                    >
                                        Start Your Journey
                                    </motion.button>

                                    <motion.button
                                        onClick={openLogin}
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        className="px-4 py-3 sm:px-8 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold text-sm sm:text-lg cursor-pointer"
                                    >
                                        Sign In
                                    </motion.button>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Content Section with Padding */}
                        <motion.div
                            className="p-4 sm:p-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate={showContent ? "visible" : "hidden"}
                        >
                            <div className="max-w-7xl mx-auto">
                                {/* Latest Posts Section */}
                                <motion.div
                                    variants={itemVariants}
                                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 mb-12"
                                >
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                            Latest Travel Experiences
                                        </h2>
                                        <p className="text-gray-600 text-lg">
                                            Discover amazing travel stories from
                                            our community of explorers
                                        </p>
                                    </div>

                                    <GuestPostsList maxPosts={6} />
                                </motion.div>

                                {/* Journey Planning Demo Section */}
                                <motion.div
                                    variants={itemVariants}
                                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 mb-12"
                                >
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                            Experience Our Journey Planning
                                            Tools
                                        </h2>
                                        <p className="text-gray-600 text-lg">
                                            See how easy it is to plan your
                                            perfect trip with our comprehensive
                                            journey creation interface
                                        </p>
                                    </div>

                                    {/* Journey Planning Interface */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                                        {/* Left Content - Journey Planning */}
                                        <div className="flex flex-col items-start gap-8 w-full lg:col-span-2">
                                            {/* Journey Title */}
                                            <div className="w-full">
                                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                        Paris Adventure - 3 Days
                                                    </h3>
                                                    <p className="text-gray-600">
                                                        A magical journey
                                                        through the City of
                                                        Light
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-4">
                                                        <span className="text-sm text-gray-500">
                                                            Starting:
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-700">
                                                            June 15, 2024
                                                        </span>
                                                        <motion.button
                                                            onClick={openSignup}
                                                            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
                                                            whileHover={{
                                                                scale: 1.02,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.98,
                                                            }}
                                                        >
                                                            Create Your Journey
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Day Filter */}
                                            <div className="w-full">
                                                <DayFilter
                                                    days={sampleDays}
                                                    activeDay={activeDay}
                                                    onDayChange={setActiveDay}
                                                />
                                            </div>

                                            {/* Day Content */}
                                            <div className="flex flex-col items-start gap-6 w-full">
                                                {/* Active Day */}
                                                {activeDay && (
                                                    <div className="flex p-4 sm:p-6 flex-col justify-center items-start gap-4 sm:gap-6 w-full rounded-lg border border-gray-200 bg-white shadow-sm">
                                                        <div className="flex flex-col justify-center items-start gap-6 sm:gap-8 w-full">
                                                            {/* Day Header */}
                                                            <div className="flex flex-col items-start gap-2 w-full">
                                                                <div className="text-gray-600 font-manrope text-sm font-normal leading-5 w-full">
                                                                    {activeDay}
                                                                </div>
                                                                <div className="text-gray-900 font-manrope text-base sm:text-lg font-semibold leading-6 w-full">
                                                                    {getDateForDay(
                                                                        activeDay
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Planning Categories */}
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
                                                                <PlanningCategory
                                                                    icon={
                                                                        <PlaceToStayIcon className="w-8 h-8" />
                                                                    }
                                                                    label="Place to stay"
                                                                    onClick={
                                                                        openSignup
                                                                    }
                                                                />
                                                                <PlanningCategory
                                                                    icon={
                                                                        <TreesIcon className="w-8 h-8 text-black" />
                                                                    }
                                                                    label="Places to go"
                                                                    onClick={
                                                                        openSignup
                                                                    }
                                                                />
                                                                <PlanningCategory
                                                                    icon={
                                                                        <FoodIcon className="w-8 h-8 text-black" />
                                                                    }
                                                                    label="Food"
                                                                    onClick={
                                                                        openSignup
                                                                    }
                                                                />
                                                                <PlanningCategory
                                                                    icon={
                                                                        <TransportIcon className="w-8 h-8 text-black" />
                                                                    }
                                                                    label="Transport"
                                                                    onClick={
                                                                        openSignup
                                                                    }
                                                                />
                                                                <PlanningCategory
                                                                    icon={
                                                                        <NotesIcon className="w-8 h-8 text-black" />
                                                                    }
                                                                    label="Notes"
                                                                    onClick={
                                                                        openSignup
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Places Display Section */}
                                                <div className="flex flex-col items-start gap-6 w-full">
                                                    {/* Show all places for active day using PlaceCard components */}
                                                    {getActiveDayPlaces()
                                                        .length > 0 && (
                                                        <div className="w-full space-y-4">
                                                            {getActiveDayPlaces().map(
                                                                (
                                                                    place,
                                                                    index
                                                                ) => (
                                                                    <PlaceCard
                                                                        key={
                                                                            index
                                                                        }
                                                                        place={
                                                                            place
                                                                        }
                                                                        index={
                                                                            index
                                                                        }
                                                                        dayKey={
                                                                            activeDay
                                                                        }
                                                                        isExpanded={isPlaceExpanded(
                                                                            activeDay,
                                                                            index
                                                                        )}
                                                                        onToggleExpansion={() =>
                                                                            togglePlaceExpansion(
                                                                                activeDay,
                                                                                index
                                                                            )
                                                                        }
                                                                        onRemove={() => {
                                                                            /* Demo mode - no removal */
                                                                        }}
                                                                        onUpdateField={() => {
                                                                            /* Demo mode - no updates */
                                                                        }}
                                                                        onAddPhoto={() => {
                                                                            /* Demo mode - no photo upload */
                                                                        }}
                                                                        onRemovePhoto={() => {
                                                                            /* Demo mode - no photo removal */
                                                                        }}
                                                                    />
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Map Section */}
                                        <div className="w-full lg:col-span-1 h-full relative">
                                            <div className="w-full h-[500px] sm:h-[600px] lg:h-[700px] rounded-lg bg-gray-200 relative overflow-hidden shadow-inner">
                                                <JourneyMap
                                                    locations={getMapLocations()}
                                                    center={getMapCenter()}
                                                    onLocationClick={(
                                                        location
                                                    ) => {
                                                        console.log(
                                                            "Location clicked:",
                                                            location
                                                        );
                                                    }}
                                                    onMapClick={() => {
                                                        /* Demo mode - no map interaction */
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Call to Action */}
                                    {/* <motion.div
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white mt-12"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <h3 className="text-2xl font-bold mb-4">
                                            Ready to Plan Your Own Journey?
                                        </h3>
                                        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                                            Join thousands of travelers using Viargos to create detailed itineraries, discover amazing places, and make unforgettable memories.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <motion.button
                                                onClick={openSignup}
                                                variants={buttonVariants}
                                                whileHover="hover"
                                                whileTap="tap"
                                                className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                                            >
                                                Start Planning Now
                                            </motion.button>
                                            <motion.button
                                                onClick={openLogin}
                                                variants={buttonVariants}
                                                whileHover="hover"
                                                whileTap="tap"
                                                className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold"
                                            >
                                                Sign In
                                            </motion.button>
                                        </div>
                                    </motion.div> */}
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Auth Modal */}
            <ModalContainer />
        </ErrorBoundary>
    );
}
