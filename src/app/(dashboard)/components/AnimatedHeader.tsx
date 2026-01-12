"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedHeaderProps {
  children: ReactNode;
}

/**
 * Animated wrapper for dashboard header
 * Extracted to separate component to optimize bundle size
 * Framer Motion is only loaded for this component
 */
export function AnimatedHeader({ children }: AnimatedHeaderProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="sticky top-0 z-50 bg-white border-b border-gray-200"
    >
      {children}
    </motion.div>
  );
}
