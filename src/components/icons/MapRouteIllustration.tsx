import React from "react";
import { motion } from "framer-motion";

interface MapRouteIllustrationProps {
  className?: string;
}

export const MapRouteIllustration: React.FC<MapRouteIllustrationProps> = ({
  className = "",
}) => {
  return (
    <svg viewBox="0 0 200 150" className={className}>
      {/* Map background */}
      <rect x="10" y="10" width="180" height="130" fill="#e8f2ff" rx="8" />

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
          ease: "linear",
        }}
      />

      {/* Location markers */}
      <circle cx="30" cy="70" r="6" fill="#001a6e" />
      <circle cx="100" cy="60" r="5" fill="#ffcf56" />
      <circle cx="170" cy="80" r="6" fill="#001a6e" />

      {/* Destination flag */}
      <path d="M 170 80 L 170 65 L 180 70 Z" fill="#ff6b6b" />
    </svg>
  );
};

export default MapRouteIllustration;
