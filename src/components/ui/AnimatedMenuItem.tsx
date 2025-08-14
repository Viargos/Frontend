'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedMenuItemProps {
  children: ReactNode;
  delay?: number;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

export default function AnimatedMenuItem({
  children,
  delay = 0,
  onClick,
  className = '',
  isActive = false,
}: AnimatedMenuItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay,
        duration: 0.3,
        ease: 'easeOut',
      }}
      whileHover={{ 
        x: 4,
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer transition-colors duration-200 ${
        isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
