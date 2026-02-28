'use client';

import { motion } from 'framer-motion';
import {
  AirplaneIcon,
  BackpackIcon,
  CalendarIcon,
  CameraIcon,
  ChatBubbleIcon,
  ClipboardListIcon,
  ClockIcon,
  CompassIcon,
  ExploreIcon,
  GlobeIllustration,
  HikingIcon,
  HotAirBalloonIcon,
  JourneyIcon,
  MapPinIcon,
  MapRouteIllustration,
  MountainIcon,
  ShipIcon,
  SocialNetworkIllustration,
  TrainIcon,
  UsersIcon,
} from '@/modules/common';

/**
 * Plan Your Journey Page - Coming Soon
 * A beautifully designed coming soon page for the journey planning feature
 */
export function PlanYourJourneyPageView() {
  return (
    <div className="from-blue-60 relative flex h-full min-h-screen flex-1 items-center justify-center overflow-hidden bg-gradient-to-br via-white to-blue-50 p-4 sm:p-6">
      {/* Decorative Background Elements */}
      <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden">
        {/* Animated Map Pins */}
        <motion.div
          className="absolute top-[60%] right-[10%] h-10 w-10 text-yellow-200 opacity-40"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        >
          <MapPinIcon className="h-full w-full" />
        </motion.div>

        {/* Compass Rose */}
        <motion.div
          className="absolute top-[20%] right-[20%] h-20 w-20 text-blue-100 opacity-20"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <CompassIcon className="h-full w-full" />
        </motion.div>

        {/* Second Airplane - Moving from right to left */}
        <motion.div
          className="absolute top-[65%]"
          style={{ left: '100%' }}
          animate={{
            x: ['-100px', 'calc(-100vw - 100px)'],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'linear',
            repeatDelay: 3,
            delay: 8,
          }}
        >
          <AirplaneIcon className="h-10 w-10 -rotate-90 text-yellow-400 opacity-35" />
        </motion.div>

        {/* Realistic Globe with Application Details */}
        <div className="absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 transform opacity-40">
          <GlobeIllustration className="h-full w-full" />
        </div>

        {/* Journey Post Cards - Floating */}
        <motion.div
          className="absolute top-[15%] right-[8%] h-32 w-40 rounded-lg border border-gray-200/50 bg-white/60 p-3 shadow-lg backdrop-blur-sm"
          animate={{
            y: [0, -15, 0],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="mb-2 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-blue-200"></div>
            <div className="h-2 w-16 rounded bg-gray-200"></div>
          </div>
          <div className="space-y-1">
            <div className="h-2 w-full rounded bg-gray-200"></div>
            <div className="h-2 w-3/4 rounded bg-gray-200"></div>
          </div>
          <div className="mt-2 h-12 rounded bg-gradient-to-br from-blue-100 to-yellow-100"></div>
        </motion.div>

        <motion.div
          className="absolute bottom-[15%] left-[5%] h-32 w-40 rounded-lg border border-gray-200/50 bg-white/60 p-3 shadow-lg backdrop-blur-sm"
          animate={{
            y: [0, 15, 0],
            rotate: [2, -2, 2],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        >
          <div className="mb-2 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-yellow-200"></div>
            <div className="h-2 w-16 rounded bg-gray-200"></div>
          </div>
          <div className="space-y-1">
            <div className="h-2 w-full rounded bg-gray-200"></div>
            <div className="h-2 w-2/3 rounded bg-gray-200"></div>
          </div>
          <div className="mt-2 h-12 rounded bg-gradient-to-br from-yellow-100 to-blue-100"></div>
        </motion.div>

        {/* Map with Route - Representing Journey Planning */}
        <motion.div
          className="absolute top-[55%] left-[10%] h-36 w-48 rounded-xl border border-gray-200/50 bg-white/50 p-3 shadow-lg backdrop-blur-sm"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [1, -1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <MapRouteIllustration className="h-full w-full" />
        </motion.div>

        {/* Social Network Connections */}
        <motion.div
          className="absolute top-[25%] left-[20%] opacity-10"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <SocialNetworkIllustration />
        </motion.div>

        {/* Photo Gallery Grid - Travel Memories */}
        <motion.div
          className="absolute right-[12%] bottom-[25%] h-24 w-32 rounded-lg border border-gray-200/50 bg-white/50 p-2 shadow-lg backdrop-blur-sm"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        >
          <div className="grid h-full grid-cols-3 gap-1">
            <div className="rounded bg-gradient-to-br from-blue-200 to-blue-300"></div>
            <div className="rounded bg-gradient-to-br from-yellow-200 to-yellow-300"></div>
            <div className="rounded bg-gradient-to-br from-blue-300 to-blue-400"></div>
            <div className="rounded bg-gradient-to-br from-yellow-300 to-yellow-400"></div>
            <div className="rounded bg-gradient-to-br from-blue-200 to-yellow-200"></div>
            <div className="rounded bg-gradient-to-br from-blue-400 to-blue-500"></div>
          </div>
        </motion.div>

        {/* Calendar/Itinerary Icon */}
        <motion.div
          className="absolute top-[70%] right-[25%] text-blue-300 opacity-20"
          animate={{
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <CalendarIcon size={60} />
        </motion.div>

        {/* Message/Chat Bubbles - Social Interaction */}
        <motion.div
          className="absolute top-[48%] right-[18%] opacity-15"
          animate={{
            y: [0, -12, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <ChatBubbleIcon size={50} className="text-[#001a6e]" />
        </motion.div>

        {/* Camera Icon - Content Creation */}
        <motion.div
          className="absolute bottom-[40%] left-[18%] text-yellow-400 opacity-20"
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 3,
          }}
        >
          <CameraIcon size={50} />
        </motion.div>

        {/* Explore/Discover Icon */}
        <motion.div
          className="absolute top-[10%] left-[45%] text-blue-200 opacity-25"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <ExploreIcon size={55} />
        </motion.div>

        {/* Activities */}

        {/* Hiking/Walking Activity */}
        <motion.div
          className="absolute top-[32%] left-[12%] text-blue-300 opacity-25"
          animate={{
            y: [0, -8, 0],
            x: [0, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <HikingIcon size={45} />
        </motion.div>

        {/* Train/Railway Activity */}
        <motion.div
          className="absolute right-[8%] bottom-[35%] text-blue-400 opacity-25"
          animate={{
            x: [-5, 5, -5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <TrainIcon size={50} />
        </motion.div>

        {/* Ship/Cruise Activity */}
        <motion.div
          className="absolute top-[62%] left-[25%] text-blue-300 opacity-20"
          animate={{
            y: [0, -6, 0],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <ShipIcon size={48} />
        </motion.div>

        {/* Hot Air Balloon */}
        <motion.div
          className="absolute top-[8%] right-[15%] text-yellow-400 opacity-25"
          animate={{
            y: [0, -15, 0],
            x: [-3, 3, -3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <HotAirBalloonIcon size={52} />
        </motion.div>

        {/* Backpack/Hiking Equipment */}
        <motion.div
          className="absolute bottom-[28%] left-[35%] text-blue-400 opacity-20"
          animate={{
            rotate: [-3, 3, -3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <BackpackIcon size={42} />
        </motion.div>

        {/* Mountain Peak */}
        <motion.div
          className="absolute right-[28%] bottom-[12%] text-gray-400 opacity-15"
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <MountainIcon size={65} />
        </motion.div>
      </div>
      <motion.div
        className="relative z-10 w-full max-w-2xl text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Icon Container */}
        <motion.div
          className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #001a6e 0%, #001456 100%)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            type: 'spring',
            stiffness: 200,
          }}
        >
          <ClipboardListIcon className="h-12 w-12 text-white" />
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Plan Your Journey
        </motion.h1>

        {/* Description */}
        <motion.p
          className="mb-8 text-lg leading-relaxed text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          We&apos;re crafting an amazing journey planning experience for you.
          Soon you&apos;ll be able to create detailed itineraries, discover
          hidden gems, and plan your perfect adventure with ease.
        </motion.p>

        {/* Feature List */}
        <motion.div
          className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="shadow-card rounded-xl border border-gray-100 bg-white/80 p-6 backdrop-blur-sm">
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: '#eef4ff' }}
            >
              <JourneyIcon className="h-6 w-6 text-[#001a6e]" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Smart Routes</h3>
            <p className="text-sm text-gray-600">
              AI-powered route suggestions based on your preferences
            </p>
          </div>

          <div className="shadow-card rounded-xl border border-gray-100 bg-white/80 p-6 backdrop-blur-sm">
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: '#fff9e6' }}
            >
              <ClockIcon className="h-6 w-6 text-[#d4a017]" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">
              Time Management
            </h3>
            <p className="text-sm text-gray-600">
              Optimize your schedule with smart time allocation
            </p>
          </div>

          <div className="shadow-card rounded-xl border border-gray-100 bg-white/80 p-6 backdrop-blur-sm">
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: '#eef4ff' }}
            >
              <UsersIcon className="h-6 w-6 text-[#001a6e]" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Collaborate</h3>
            <p className="text-sm text-gray-600">
              Plan together with friends and family
            </p>
          </div>
        </motion.div>

        {/* Animated Progress Indicator */}
        <motion.div
          className="mx-auto max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <motion.div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: '#001a6e' }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: '#001a6e' }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2,
              }}
            />
            <motion.div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: '#001a6e' }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.4,
              }}
            />
          </div>
          <p className="mt-4 text-sm text-gray-500">
            We&apos;re working hard to bring this feature to you
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
