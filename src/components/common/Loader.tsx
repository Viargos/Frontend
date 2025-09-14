"use client";

import { motion } from "framer-motion";

interface LoaderProps {
  /** Custom text to display */
  text?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Show/hide the animated dots */
  showDots?: boolean;
  /** Custom logo text (defaults to "V") */
  logoText?: string;
  /** Background gradient colors */
  gradient?: {
    from: string;
    via: string;
    to: string;
  };
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show as fullscreen overlay */
  fullscreen?: boolean;
  /** Custom className */
  className?: string;
  /** Animation exit props for AnimatePresence */
  exit?: any;
}

export default function Loader({
  text = "Viargos",
  subtitle = "Discovering Amazing Journeys...",
  showDots = true,
  logoText = "V",
  gradient = {
    from: "blue-500",
    via: "purple-500",
    to: "indigo-600"
  },
  size = "lg",
  fullscreen = true,
  className = "",
  exit
}: LoaderProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      logo: "w-12 h-12",
      logoText: "text-xl",
      title: "text-2xl",
      subtitle: "text-sm",
      dots: "w-2 h-2"
    },
    md: {
      logo: "w-16 h-16",
      logoText: "text-2xl",
      title: "text-3xl",
      subtitle: "text-base",
      dots: "w-2.5 h-2.5"
    },
    lg: {
      logo: "w-20 h-20",
      logoText: "text-3xl",
      title: "text-4xl",
      subtitle: "text-xl",
      dots: "w-3 h-3"
    }
  };

  const config = sizeConfig[size];
  const baseClassName = fullscreen 
    ? "fixed inset-0 flex items-center justify-center z-50"
    : "flex items-center justify-center w-full h-full";

  const exitAnimation = exit || {
    opacity: 0,
    scale: 1.1,
    transition: {
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  };

  return (
    <motion.div
      className={`${baseClassName} bg-gradient-to-br from-${gradient.from} via-${gradient.via} to-${gradient.to} ${className}`}
      exit={exitAnimation}
    >
      <div className="text-center">
        {/* Animated Logo */}
        <motion.div
          className="mb-8"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className={`${config.logo} bg-white rounded-2xl mx-auto flex items-center justify-center shadow-2xl`}>
            <span className={`${config.logoText} font-bold text-blue-600`}>{logoText}</span>
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.h1
          className={`${config.title} font-bold text-white mb-4`}
          animate={{
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {text}
        </motion.h1>

        {subtitle && (
          <motion.p
            className={`${config.subtitle} text-white/80`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Loading Dots */}
        {showDots && (
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`${config.dots} bg-white rounded-full`}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Preset configurations for common use cases
export const LoaderPresets = {
  // Full page loader
  fullPage: (props?: Partial<LoaderProps>) => (
    <Loader {...props} />
  ),

  // Small inline loader
  inline: (props?: Partial<LoaderProps>) => (
    <Loader
      size="sm"
      fullscreen={false}
      subtitle=""
      className="py-8"
      {...props}
    />
  ),

  // Card loader
  card: (props?: Partial<LoaderProps>) => (
    <Loader
      size="md"
      fullscreen={false}
      gradient={{
        from: "gray-100",
        via: "gray-200",
        to: "gray-300"
      }}
      className="rounded-lg py-12"
      {...props}
    />
  ),

  // Custom branded loader
  branded: (brandName: string, props?: Partial<LoaderProps>) => (
    <Loader
      text={brandName}
      subtitle={`Loading ${brandName}...`}
      logoText={brandName.charAt(0).toUpperCase()}
      {...props}
    />
  )
};
