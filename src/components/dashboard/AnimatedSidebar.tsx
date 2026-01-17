"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSidebarProps {
  children: ReactNode;
  isCollapsed?: boolean;
}

/**
 * Animated wrapper for dashboard sidebar
 * Extracted to separate component to optimize bundle size
 * Framer Motion is only loaded for this component
 */
export function AnimatedSidebar({ children, isCollapsed = false }: AnimatedSidebarProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ 
        x: 0, 
        opacity: 1,
        width: isCollapsed ? '4rem' : undefined
      }}
      transition={{ duration: 0.3 }}
      className={`hidden sm:block bg-gray-100 flex-shrink-0 h-full transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-16 lg:w-64'
      }`}
    >
      {children}
    </motion.div>
  );
}
