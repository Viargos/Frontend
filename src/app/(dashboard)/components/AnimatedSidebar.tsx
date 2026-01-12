"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSidebarProps {
  children: ReactNode;
}

/**
 * Animated wrapper for dashboard sidebar
 * Extracted to separate component to optimize bundle size
 * Framer Motion is only loaded for this component
 */
export function AnimatedSidebar({ children }: AnimatedSidebarProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="hidden sm:block w-16 lg:w-64 bg-gray-100 flex-shrink-0 h-full"
    >
      {children}
    </motion.div>
  );
}
