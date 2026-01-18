'use client';

import { motion } from 'framer-motion';
import {
  ClipboardListIcon,
  ClockIcon,
  UsersIcon,
  JourneyIcon,
  MapPinIcon,
  CompassIcon,
  AirplaneIcon,
  CalendarIcon,
  ChatBubbleIcon,
  CameraIcon,
  ExploreIcon,
  HikingIcon,
  TrainIcon,
  ShipIcon,
  HotAirBalloonIcon,
  BackpackIcon,
  MountainIcon,
  GlobeIllustration,
  MapRouteIllustration,
  SocialNetworkIllustration,
} from '@/components/icons';

/**
 * Plan Your Journey Page - Coming Soon
 * A beautifully designed coming soon page for the journey planning feature
 */
export default function PlanYourJourneyPage() {
  return (
    <div className="flex-1 flex items-center justify-center h-full min-h-screen p-4 sm:p-6 relative overflow-hidden bg-gradient-to-br from-blue-60 via-white to-blue-50">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Animated Map Pins */}
        <motion.div
          className="absolute top-[60%] right-[10%] w-10 h-10 text-yellow-200 opacity-40"
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
          <MapPinIcon className="w-full h-full" />
        </motion.div>

        {/* Compass Rose */}
        <motion.div
          className="absolute top-[20%] right-[20%] w-20 h-20 text-blue-100 opacity-20"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <CompassIcon className="w-full h-full" />
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
          <AirplaneIcon className="w-10 h-10 text-yellow-400 opacity-35 -rotate-90" />
        </motion.div>

        {/* Realistic Globe with Application Details */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-40">
          <GlobeIllustration className="w-full h-full" />
        </div>

        {/* Journey Post Cards - Floating */}
        <motion.div
          className="absolute top-[15%] right-[8%] w-40 h-32 bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200/50"
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
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-blue-200"></div>
            <div className="h-2 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-1">
            <div className="h-2 bg-gray-200 rounded w-full"></div>
            <div className="h-2 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="mt-2 h-12 bg-gradient-to-br from-blue-100 to-yellow-100 rounded"></div>
        </motion.div>

        <motion.div
          className="absolute bottom-[15%] left-[5%] w-40 h-32 bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200/50"
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
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-yellow-200"></div>
            <div className="h-2 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-1">
            <div className="h-2 bg-gray-200 rounded w-full"></div>
            <div className="h-2 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="mt-2 h-12 bg-gradient-to-br from-yellow-100 to-blue-100 rounded"></div>
        </motion.div>

        {/* Map with Route - Representing Journey Planning */}
        <motion.div
          className="absolute top-[55%] left-[10%] w-48 h-36 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-gray-200/50"
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
          <MapRouteIllustration className="w-full h-full" />
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
          className="absolute bottom-[25%] right-[12%] w-32 h-24 bg-white/50 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-gray-200/50"
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
          <div className="grid grid-cols-3 gap-1 h-full">
            <div className="bg-gradient-to-br from-blue-200 to-blue-300 rounded"></div>
            <div className="bg-gradient-to-br from-yellow-200 to-yellow-300 rounded"></div>
            <div className="bg-gradient-to-br from-blue-300 to-blue-400 rounded"></div>
            <div className="bg-gradient-to-br from-yellow-300 to-yellow-400 rounded"></div>
            <div className="bg-gradient-to-br from-blue-200 to-yellow-200 rounded"></div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded"></div>
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
          className="absolute bottom-[35%] right-[8%] text-blue-400 opacity-25"
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
          className="absolute bottom-[12%] right-[28%] text-gray-400 opacity-15"
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
        className="max-w-2xl w-full text-center relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Icon Container */}
        <motion.div
          className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-full shadow-lg"
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
          <ClipboardListIcon className="w-12 h-12 text-white" />
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Plan Your Journey
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-lg text-gray-600 mb-8 leading-relaxed"
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
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-card border border-gray-100">
            <div
              className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#eef4ff' }}
            >
              <JourneyIcon className="w-6 h-6 text-[#001a6e]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Routes</h3>
            <p className="text-sm text-gray-600">
              AI-powered route suggestions based on your preferences
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-card border border-gray-100">
            <div
              className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#fff9e6' }}
            >
              <ClockIcon className="w-6 h-6 text-[#d4a017]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Time Management
            </h3>
            <p className="text-sm text-gray-600">
              Optimize your schedule with smart time allocation
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-card border border-gray-100">
            <div
              className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#eef4ff' }}
            >
              <UsersIcon className="w-6 h-6 text-[#001a6e]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Collaborate</h3>
            <p className="text-sm text-gray-600">
              Plan together with friends and family
            </p>
          </div>
        </motion.div>

        {/* Animated Progress Indicator */}
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <motion.div
              className="w-2 h-2 rounded-full"
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
              className="w-2 h-2 rounded-full"
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
              className="w-2 h-2 rounded-full"
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
