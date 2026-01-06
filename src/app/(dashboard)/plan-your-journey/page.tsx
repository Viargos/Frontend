'use client';

import { motion } from 'framer-motion';

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
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
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
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L8 12l4 10 4-10-4-10zm0 3.5L13.5 10h-3L12 5.5z" />
            <circle cx="12" cy="12" r="2" />
            <path d="M12 7l-1 5h2l-1-5zm0 10l-1-5h2l-1 5z" />
          </svg>
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
          <svg
            className="w-10 h-10 text-yellow-400 opacity-35"
            fill="currentColor"
            viewBox="0 0 24 24"
            style={{ transform: 'rotate(-90deg)' }}
          >
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </motion.div>

        {/* Realistic Globe with Application Details */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-40">
          <svg viewBox="0 0 300 300" className="w-full h-full">
            {/* Outer glow */}
            <defs>
              <radialGradient id="globeGlow">
                <stop offset="70%" stopColor="#001a6e" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#001a6e" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="oceanGradient">
                <stop offset="0%" stopColor="#e8f4ff" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#d4e8ff" stopOpacity="0.08" />
              </radialGradient>
              <linearGradient
                id="meridianGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#001a6e" stopOpacity="0.02" />
                <stop offset="50%" stopColor="#001a6e" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#001a6e" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Glow effect */}
            <circle cx="150" cy="150" r="140" fill="url(#globeGlow)" />

            {/* Ocean base */}
            <circle cx="150" cy="150" r="120" fill="url(#oceanGradient)" />

            {/* Latitude lines (parallels) */}
            <ellipse
              cx="150"
              cy="150"
              rx="120"
              ry="20"
              fill="none"
              stroke="#001a6e"
              strokeWidth="0.4"
              opacity="0.15"
            />
            <ellipse
              cx="150"
              cy="150"
              rx="120"
              ry="40"
              fill="none"
              stroke="#001a6e"
              strokeWidth="0.4"
              opacity="0.15"
            />
            <ellipse
              cx="150"
              cy="150"
              rx="120"
              ry="60"
              fill="none"
              stroke="#001a6e"
              strokeWidth="0.4"
              opacity="0.15"
            />
            <ellipse
              cx="150"
              cy="150"
              rx="120"
              ry="80"
              fill="none"
              stroke="#001a6e"
              strokeWidth="0.4"
              opacity="0.15"
            />
            <ellipse
              cx="150"
              cy="150"
              rx="120"
              ry="100"
              fill="none"
              stroke="#001a6e"
              strokeWidth="0.4"
              opacity="0.15"
            />

            {/* Equator - highlighted */}
            <line
              x1="30"
              y1="150"
              x2="270"
              y2="150"
              stroke="#001a6e"
              strokeWidth="0.6"
              opacity="0.2"
              strokeDasharray="3,2"
            />

            {/* Longitude lines (meridians) - more detailed */}
            <ellipse
              cx="150"
              cy="150"
              rx="120"
              ry="120"
              fill="none"
              stroke="url(#meridianGradient)"
              strokeWidth="0.5"
            />
            <ellipse
              cx="150"
              cy="150"
              rx="100"
              ry="120"
              fill="none"
              stroke="#001a6e"
              strokeWidth="0.4"
              opacity="0.12"
            />
            <ellipse
              cx="150"
              cy="150"
              rx="80"
              ry="120"
              fill="none"
              stroke="#001a6e"
              strokeWidth="0.4"
              opacity="0.12"
            />
            <ellipse
              cx="150"
              cy="150"
              rx="60"
              ry="120"
              fill="none"
              stroke="#001a6e"
              strokeWidth="0.4"
              opacity="0.12"
            />
            <ellipse
              cx="150"
              cy="150"
              rx="40"
              ry="120"
              fill="none"
              stroke="#001a6e"
              strokeWidth="0.4"
              opacity="0.12"
            />
            <ellipse
              cx="150"
              cy="150"
              rx="20"
              ry="120"
              fill="none"
              stroke="#001a6e"
              strokeWidth="0.4"
              opacity="0.12"
            />

            {/* Prime Meridian - vertical */}
            <line
              x1="150"
              y1="30"
              x2="150"
              y2="270"
              stroke="#001a6e"
              strokeWidth="0.6"
              opacity="0.2"
              strokeDasharray="3,2"
            />

            {/* Simplified Continents - Tiny landmasses */}
            {/* North America */}
            <path
              d="M 80 90 Q 75 80, 85 75 L 95 72 Q 100 75, 98 82 L 95 95 Q 88 98, 80 90 Z"
              fill="#001a6e"
              opacity="0.12"
            />

            {/* South America */}
            <path
              d="M 95 130 L 100 115 Q 105 118, 103 128 L 100 145 Q 95 148, 92 142 Z"
              fill="#001a6e"
              opacity="0.12"
            />

            {/* Europe */}
            <path
              d="M 145 75 L 155 70 L 165 75 Q 168 82, 160 85 L 148 83 Z"
              fill="#001a6e"
              opacity="0.12"
            />

            {/* Africa */}
            <path
              d="M 155 95 Q 160 90, 165 95 L 168 110 Q 170 125, 165 135 L 160 140 Q 152 138, 155 130 L 153 110 Z"
              fill="#001a6e"
              opacity="0.12"
            />

            {/* Asia */}
            <path
              d="M 170 70 Q 185 65, 195 75 L 210 85 Q 215 95, 208 105 L 195 110 Q 185 108, 180 100 L 175 85 Z"
              fill="#001a6e"
              opacity="0.12"
            />

            {/* Australia */}
            <path
              d="M 200 155 Q 210 152, 215 158 L 218 165 Q 215 172, 208 170 L 200 165 Z"
              fill="#001a6e"
              opacity="0.12"
            />

            {/* Application Elements on Globe */}

            {/* Travel Routes connecting continents */}
            <motion.path
              d="M 90 85 Q 120 75, 150 78"
              stroke="#ffcf56"
              strokeWidth="0.8"
              fill="none"
              strokeDasharray="2,2"
              opacity="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <motion.path
              d="M 160 80 Q 180 85, 200 90"
              stroke="#ffcf56"
              strokeWidth="0.8"
              fill="none"
              strokeDasharray="2,2"
              opacity="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
                delay: 1,
              }}
            />
            <motion.path
              d="M 98 125 Q 130 140, 165 130"
              stroke="#001a6e"
              strokeWidth="0.8"
              fill="none"
              strokeDasharray="2,2"
              opacity="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
                delay: 2,
              }}
            />

            {/* Location Pins on major cities/destinations */}
            <g opacity="0.25">
              {/* Pin 1 - North America */}
              <circle cx="88" cy="85" r="2.5" fill="#001a6e" />
              <circle cx="88" cy="85" r="1" fill="white" />

              {/* Pin 2 - Europe */}
              <circle cx="155" cy="78" r="2.5" fill="#001a6e" />
              <circle cx="155" cy="78" r="1" fill="white" />

              {/* Pin 3 - Asia */}
              <circle cx="195" cy="92" r="2.5" fill="#ffcf56" />
              <circle cx="195" cy="92" r="1" fill="white" />

              {/* Pin 4 - South America */}
              <circle cx="98" cy="130" r="2.5" fill="#001a6e" />
              <circle cx="98" cy="130" r="1" fill="white" />

              {/* Pin 5 - Africa */}
              <circle cx="162" cy="120" r="2.5" fill="#ffcf56" />
              <circle cx="162" cy="120" r="1" fill="white" />

              {/* Pin 6 - Australia */}
              <circle cx="210" cy="162" r="2.5" fill="#001a6e" />
              <circle cx="210" cy="162" r="1" fill="white" />
            </g>

            {/* User activity nodes - pulsing */}
            <motion.circle
              cx="88"
              cy="85"
              r="4"
              fill="none"
              stroke="#001a6e"
              strokeWidth="0.5"
              opacity="0.2"
              animate={{
                r: [4, 8, 4],
                opacity: [0.2, 0, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <motion.circle
              cx="195"
              cy="92"
              r="4"
              fill="none"
              stroke="#ffcf56"
              strokeWidth="0.5"
              opacity="0.25"
              animate={{
                r: [4, 8, 4],
                opacity: [0.25, 0, 0.25],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 1,
              }}
            />
            <motion.circle
              cx="162"
              cy="120"
              r="4"
              fill="none"
              stroke="#ffcf56"
              strokeWidth="0.5"
              opacity="0.25"
              animate={{
                r: [4, 8, 4],
                opacity: [0.25, 0, 0.25],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 2,
              }}
            />

            {/* Journey count indicators - small numbers */}
            <text
              x="70"
              y="92"
              fontSize="4"
              fill="#001a6e"
              opacity="0.2"
              fontWeight="bold"
            >
              247
            </text>
            <text
              x="140"
              y="75"
              fontSize="4"
              fill="#001a6e"
              opacity="0.2"
              fontWeight="bold"
            >
              892
            </text>
            <text
              x="185"
              y="88"
              fontSize="4"
              fill="#001a6e"
              opacity="0.2"
              fontWeight="bold"
            >
              1.2K
            </text>
            <text
              x="145"
              y="125"
              fontSize="4"
              fill="#001a6e"
              opacity="0.2"
              fontWeight="bold"
            >
              634
            </text>

            {/* Small airplane inside globe */}
            <motion.g
              animate={{
                offsetDistance: ['0%', '100%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <animateMotion
                dur="8s"
                repeatCount="indefinite"
                path="M 90 85 Q 120 75, 150 78 Q 180 82, 200 90"
              />
              <path
                d="M -1.5 0 L 1.5 0 L 1.5 -0.5 L 0.5 -1.5 L -0.5 -1.5 L -1.5 -0.5 Z"
                fill="#001a6e"
                opacity="0.2"
              />
            </motion.g>

            {/* Globe outline */}
            <circle
              cx="150"
              cy="150"
              r="120"
              fill="none"
              stroke="#001a6e"
              strokeWidth="1"
              opacity="0.15"
            />

            {/* Subtle rotation effect - dots on meridians */}
            <motion.circle
              cx="150"
              cy="30"
              r="1.5"
              fill="#001a6e"
              opacity="0.2"
              animate={{
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.circle
              cx="150"
              cy="270"
              r="1.5"
              fill="#001a6e"
              opacity="0.2"
              animate={{
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            />
          </svg>
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
          <svg viewBox="0 0 200 150" className="w-full h-full">
            {/* Map background */}
            <rect
              x="10"
              y="10"
              width="180"
              height="130"
              fill="#e8f2ff"
              rx="8"
            />

            {/* Route line */}
            <motion.path
              d="M 30 70 Q 70 40, 100 60 T 170 80"
              stroke="#001a6e"
              strokeWidth="3"
              fill="none"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Location markers */}
            <circle cx="30" cy="70" r="6" fill="#001a6e" />
            <circle cx="100" cy="60" r="5" fill="#ffcf56" />
            <circle cx="170" cy="80" r="6" fill="#001a6e" />

            {/* Destination flag */}
            <path d="M 170 80 L 170 65 L 180 70 Z" fill="#ff6b6b" />
          </svg>
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
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* Connection lines */}
            <line
              x1="30"
              y1="30"
              x2="60"
              y2="60"
              stroke="#001a6e"
              strokeWidth="2"
            />
            <line
              x1="90"
              y1="30"
              x2="60"
              y2="60"
              stroke="#001a6e"
              strokeWidth="2"
            />
            <line
              x1="60"
              y1="60"
              x2="60"
              y2="90"
              stroke="#001a6e"
              strokeWidth="2"
            />

            {/* User nodes */}
            <circle cx="30" cy="30" r="8" fill="#001a6e" />
            <circle cx="90" cy="30" r="8" fill="#001a6e" />
            <circle cx="60" cy="60" r="10" fill="#ffcf56" />
            <circle cx="60" cy="90" r="8" fill="#001a6e" />
          </svg>
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
          <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
          </svg>
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
          <svg width="50" height="50" viewBox="0 0 24 24" fill="#001a6e">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
          </svg>
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
          <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 15.2c-2.5 0-4.5-2-4.5-4.5S9.5 6.2 12 6.2s4.5 2 4.5 4.5-2 4.5-4.5 4.5zM12 8.2c-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5z" />
            <path d="M20 5h-3.2L15 3H9L7.2 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 14H4V7h4.5l1.8-2h3.4l1.8 2H20v12z" />
          </svg>
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
          <svg width="55" height="55" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z" />
          </svg>
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
          <svg width="45" height="45" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />
          </svg>
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
          <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm5.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-7h-5V6h5v4z" />
          </svg>
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
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z" />
          </svg>
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
          <svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm1 16h-2v-2h2v2zm3-4.5c0 .83-.67 1.5-1.5 1.5h-3c-.83 0-1.5-.67-1.5-1.5v-.5h6v.5zm-.5-3.5c0 1.93-1.57 3.5-3.5 3.5S8.5 11.93 8.5 10c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5z" />
            <circle cx="12" cy="10" r="2.5" opacity="0.6" />
          </svg>
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
          <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 8v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8c0-1.86 1.28-3.41 3-3.86V2h3v2h4V2h3v2.14c1.72.45 3 2 3 3.86zM6 12v2h12v-2H6zm10-6H8v2h8V6z" />
          </svg>
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
          <svg width="65" height="65" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z" />
          </svg>
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
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
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
          We&apos;re crafting an amazing journey planning experience for you. Soon
          you&apos;ll be able to create detailed itineraries, discover hidden gems,
          and plan your perfect adventure with ease.
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
              <svg
                className="w-6 h-6"
                style={{ color: '#001a6e' }}
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
              <svg
                className="w-6 h-6"
                style={{ color: '#d4a017' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
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
              <svg
                className="w-6 h-6"
                style={{ color: '#001a6e' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
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
