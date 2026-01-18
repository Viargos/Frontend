import React from "react";
import { motion } from "framer-motion";

interface GlobeIllustrationProps {
  className?: string;
}

export const GlobeIllustration: React.FC<GlobeIllustrationProps> = ({
  className = "",
}) => {
  return (
    <svg viewBox="0 0 300 300" className={className}>
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
          ease: "linear",
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
          ease: "linear",
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
          ease: "linear",
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
          ease: "easeOut",
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
          ease: "easeOut",
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
          ease: "easeOut",
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
          offsetDistance: ["0%", "100%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
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
          ease: "easeInOut",
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
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </svg>
  );
};

export default GlobeIllustration;
