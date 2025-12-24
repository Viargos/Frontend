"use client";

import { motion } from "framer-motion";

// Skeleton component with shimmer effect using Framer Motion
const SkeletonItem = ({ 
  className, 
  delay = 0 
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
        delay: delay + 0.5
      }}
    />
  </motion.div>
);

const ProfileHeaderSkeleton = () => (
  <motion.div
    className="flex flex-col justify-center items-start w-full rounded-md bg-white shadow-lg overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    {/* Hero Background Skeleton */}
    <SkeletonItem className="h-32 sm:h-40 md:h-48 lg:h-56 w-full" />
    
    {/* Avatar and Info Section */}
    <div className="flex pb-4 sm:pb-6 px-4 sm:px-6 w-full -mt-12 sm:justify-between flex-col sm:flex-row items-center sm:items-end justify-start gap-4 sm:gap-6 lg:gap-10 xl:gap-16">
      <div className="flex flex-col justify-center items-center sm:items-start gap-2 sm:gap-3">
        {/* Avatar Skeleton */}
        <SkeletonItem 
          className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-lg" 
          delay={0.1}
        />
        
        {/* Name Skeleton */}
        <SkeletonItem 
          className="h-6 sm:h-7 lg:h-8 w-32 sm:w-40 lg:w-48" 
          delay={0.2}
        />
        
        {/* Email Skeleton */}
        <SkeletonItem 
          className="h-4 sm:h-5 w-48 sm:w-56" 
          delay={0.3}
        />
        
        {/* Join Date Skeleton */}
        <SkeletonItem 
          className="h-3 sm:h-4 w-36 sm:w-44" 
          delay={0.4}
        />
      </div>

      {/* Stats Skeleton */}
      <motion.div
        className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 lg:gap-8 w-full sm:w-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-1 min-w-0">
              <SkeletonItem 
                className="h-4 sm:h-5 lg:h-6 w-8 sm:w-10" 
                delay={0.4 + index * 0.1}
              />
              <SkeletonItem 
                className="h-3 sm:h-4 w-12 sm:w-16" 
                delay={0.5 + index * 0.1}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </motion.div>
);

const TabsSkeleton = () => (
  <motion.div
    className="flex items-center gap-6 w-full border-b border-gray-200 px-4 sm:px-6"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
  >
    {[1, 2, 3].map((_, index) => (
      <SkeletonItem 
        key={index}
        className="h-6 w-16 sm:w-20 mb-4" 
        delay={0.4 + index * 0.1}
      />
    ))}
  </motion.div>
);

const ContentSkeleton = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 0.7 + i * 0.08,
        ease: "easeOut"
      }
    })
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.08
      }
    }
  };

  return (
    <motion.div
      className="flex flex-col items-start gap-4 w-full px-4 sm:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Title Skeleton */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <SkeletonItem 
          className="h-7 sm:h-8 w-48 sm:w-64" 
          delay={0.6}
        />
      </motion.div>
      
      {/* Content Grid Skeleton */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[1, 2, 3, 4, 5, 6].map((_, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            variants={cardVariants as any}
            custom={index}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            {/* Card Image Skeleton */}
            <SkeletonItem 
              className="h-48 w-full rounded-none" 
              delay={0.8 + index * 0.08}
            />
            
            {/* Card Content Skeleton */}
            <motion.div 
              className="p-4 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.9 + index * 0.08 }}
            >
              <SkeletonItem 
                className="h-5 w-3/4" 
                delay={0.95 + index * 0.08}
              />
              <SkeletonItem 
                className="h-4 w-full" 
                delay={1.0 + index * 0.08}
              />
              <SkeletonItem 
                className="h-4 w-2/3" 
                delay={1.05 + index * 0.08}
              />
              
              {/* Card Footer Skeleton */}
              <motion.div 
                className="flex items-center justify-between pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.1 + index * 0.08 }}
              >
                <div className="flex items-center gap-2">
                  <SkeletonItem 
                    className="h-6 w-6 rounded-full" 
                    delay={1.15 + index * 0.08}
                  />
                  <SkeletonItem 
                    className="h-4 w-16" 
                    delay={1.2 + index * 0.08}
                  />
                </div>
                <SkeletonItem 
                  className="h-4 w-12" 
                  delay={1.25 + index * 0.08}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default function UserProfileSkeleton() {
  return (
    <motion.div
      className="flex flex-col items-start gap-6 flex-1 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Profile Header Skeleton */}
      <ProfileHeaderSkeleton />
      
      {/* Tabs Skeleton */}
      <TabsSkeleton />
      
      {/* Content Skeleton */}
      <ContentSkeleton />
    </motion.div>
  );
}
