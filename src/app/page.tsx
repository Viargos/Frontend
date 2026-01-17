'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { Header } from '@/components/home';
import ModalContainer from '@/components/auth/ModalContainer';
import { ErrorBoundary, Loader } from '@/components/common';
import { GuestPostsList } from '@/components/post';
import { DayFilter, PlanningCategory } from '@/components/journey';
import PlaceToStayIcon from '@/components/icons/PlaceToStayIcon';
import { TreesIcon } from '@/components/icons/TreesIcon';
import { FoodIcon } from '@/components/icons/FoodIcon';
import { TransportIcon } from '@/components/icons/TransportIcon';
import { NotesIcon } from '@/components/icons/NotesIcon';
import { PlaceType, CreateJourneyPlace } from '@/types/journey.types';
import JourneyMap from '@/components/maps/JourneyMap';
import { PlaceCard } from '@/components/journey';
import '@/lib/scroll-utils'; // Import scroll reset utility
import Lottie from 'lottie-react';
import planeAnimation from '@/lib/animation/plane.json';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { AnimatedRouteDemo } from '@/components/maps/AnimatedRouteDemo';

export default function Home() {
  const { user, isAuthenticated, openSignup, openLogin } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const { location: currentLocation } = useCurrentLocation();

  // Sample Journey Data
  const [sampleDays] = useState(['Day 1', 'Day 2', 'Day 3']);
  const [activeDay, setActiveDay] = useState('Day 1');
  const [expandedPlaces, setExpandedPlaces] = useState<{
    [key: string]: boolean;
  }>({});

  // Sample places data for demonstration
  const samplePlaces: { [key: string]: CreateJourneyPlace[] } = {
    'Day 1': [
      {
        type: PlaceType.STAY,
        name: 'Hotel Paris Central',
        description:
          'Luxury hotel in the heart of Paris with amazing views of the Eiffel Tower',
        startTime: '15:00',
        endTime: '11:00',
        address: '123 Rue de Rivoli, Paris, France',
        latitude: 48.8566,
        longitude: 2.3522,
        photos: [],
      },
      {
        type: PlaceType.ACTIVITY,
        name: 'Eiffel Tower',
        description:
          'Visit the iconic Eiffel Tower and enjoy panoramic views of Paris',
        startTime: '09:00',
        endTime: '12:00',
        address: 'Champ de Mars, Paris, France',
        latitude: 48.8584,
        longitude: 2.2945,
        photos: [],
      },
      {
        type: PlaceType.FOOD,
        name: 'Le Comptoir du Relais',
        description:
          'Traditional French bistro with authentic Parisian atmosphere',
        startTime: '19:00',
        endTime: '21:30',
        address: "9 Carrefour de l'Odéon, Paris, France",
        latitude: 48.8509,
        longitude: 2.3364,
        photos: [],
      },
    ],
    'Day 2': [
      {
        type: PlaceType.ACTIVITY,
        name: 'Louvre Museum',
        description:
          "Explore the world's largest art museum and see the Mona Lisa",
        startTime: '10:00',
        endTime: '16:00',
        address: 'Rue de Rivoli, Paris, France',
        latitude: 48.8606,
        longitude: 2.3376,
        photos: [],
      },
      {
        type: PlaceType.TRANSPORT,
        name: 'Metro Line 1',
        description: 'Take the metro from Louvre to Champs-Élysées',
        startTime: '16:30',
        endTime: '17:00',
        address: 'Paris Metro System',
        latitude: 48.8566,
        longitude: 2.3522,
        photos: [],
      },
      {
        type: PlaceType.FOOD,
        name: 'Ladurée Champs-Élysées',
        description: 'Famous patisserie for authentic French macarons',
        startTime: '17:30',
        endTime: '18:30',
        address: '75 Avenue des Champs-Élysées, Paris, France',
        latitude: 48.8698,
        longitude: 2.3074,
        photos: [],
      },
    ],
    'Day 3': [
      {
        type: PlaceType.ACTIVITY,
        name: 'Montmartre & Sacré-Cœur',
        description:
          'Explore the artistic district and visit the beautiful basilica',
        startTime: '09:00',
        endTime: '14:00',
        address: 'Montmartre, Paris, France',
        latitude: 48.8867,
        longitude: 2.3431,
        photos: [],
      },
      {
        type: PlaceType.NOTE,
        name: 'Travel Tips',
        description:
          "Remember to bring comfortable walking shoes. Best time to visit is early morning to avoid crowds. Don't forget your camera!",
        startTime: '08:00',
        endTime: '08:00',
        address: '',
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
    setExpandedPlaces(prev => ({
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
      place =>
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
    const dayNumber = parseInt(day.split(' ')[1]);
    const baseDate = new Date('2024-06-15');
    baseDate.setDate(baseDate.getDate() + dayNumber - 1);
    return baseDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
    if (isAuthenticated && user) router.push('/dashboard');
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
        ease: 'easeOut',
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
              variants={heroVariants}
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
                  backgroundImage: 'url(/hero.svg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
                className="relative z-10 text-center flex flex-col justify-start items-center min-h-[700px] sm:min-h-[800px] px-4 max-w-7xl mx-auto w-full pt-8 sm:pt-12"
              >
                <motion.h1
                  className="text-3xl sm:text-6xl font-bold text-gray-900 mb-6"
                  variants={itemVariants}
                  initial="hidden"
                  animate={showContent ? 'visible' : 'hidden'}
                >
                  Welcome to <span className="text-blue-600">Viargos</span>
                </motion.h1>

                <motion.p
                  className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed"
                  variants={itemVariants}
                  initial="hidden"
                  animate={showContent ? 'visible' : 'hidden'}
                >
                  The ultimate travel companion for planning journeys, sharing
                  experiences, and discovering amazing destinations with a
                  global community of travelers.
                </motion.p>

                <motion.div
                  className="flex flex-row gap-3 sm:gap-4 justify-center items-center"
                  variants={itemVariants}
                  initial="hidden"
                  animate={showContent ? 'visible' : 'hidden'}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <ModalContainer />
    </ErrorBoundary>
  );
}
