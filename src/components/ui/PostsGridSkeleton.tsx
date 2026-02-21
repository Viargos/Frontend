"use client";

import { motion } from "framer-motion";

const SkeletonItem = ({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) => (
  <motion.div
    className={`bg-gray-200 rounded ${className} overflow-hidden relative`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, delay }}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
      initial={{ x: "-100%" }}
      animate={{ x: "100%" }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay + 0.5,
      }}
    />
  </motion.div>
);

/**
 * Skeleton loader for the profile posts grid.
 * Matches the layout: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
 * with aspect-square image and content section per card.
 */
export default function PostsGridSkeleton({ className = "" }: { className?: string }) {
  const skeletonCount = 8;

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            {/* Image placeholder - aspect-square */}
            <div className="relative aspect-square bg-gray-100">
              <SkeletonItem
                className="h-full w-full rounded-none"
                delay={index * 0.06}
              />
            </div>

            {/* Content section - matches p-3 layout */}
            <div className="p-3 space-y-2">
              {/* Description lines */}
              <SkeletonItem
                className="h-4 w-full"
                delay={index * 0.06 + 0.1}
              />
              <SkeletonItem
                className="h-4 w-3/4"
                delay={index * 0.06 + 0.15}
              />

              {/* Stats row */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <SkeletonItem
                    className="h-3 w-8 rounded"
                    delay={index * 0.06 + 0.2}
                  />
                  <SkeletonItem
                    className="h-3 w-8 rounded"
                    delay={index * 0.06 + 0.25}
                  />
                </div>
                <SkeletonItem
                  className="h-3 w-16 rounded"
                  delay={index * 0.06 + 0.2}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
