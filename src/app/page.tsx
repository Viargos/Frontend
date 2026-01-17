'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { Header } from '@/components/home';
import ModalContainer from '@/components/auth/ModalContainer';
import { ErrorBoundary, Loader } from '@/components/common';
import '@/lib/scroll-utils'; // Import scroll reset utility
import Lottie from 'lottie-react';
import planeAnimation from '@/lib/animation/plane.json';

export default function Home() {
  const { user, isAuthenticated, openSignup, openLogin } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Simulate loading and setup initial animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Delay content appearance for smoother transition
      setTimeout(() => {
        setShowContent(true);
      }, 200);
    }, 1500); // Show loading for 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && user) router.push('/dashboard');
  }, [isAuthenticated, user, router]);

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  const heroVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  const buttonVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <Loader key="loading" />
        ) : (
          <motion.div
            key="content"
            className="min-h-screen bg-gray-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Top Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full bg-white border-b border-gray-200 px-4"
            >
              <div className="max-w-7xl mx-auto">
                <Header user={user} />
              </div>
            </motion.div>

            {/* Hero Section - Full Width */}
            <motion.div
              variants={heroVariants}
              className="relative overflow-hidden min-h-[700px] sm:min-h-[800px] w-full"
            >
              {/* Plane Animation Background */}
              <div className="absolute inset-0 z-0">
                <Lottie
                  animationData={planeAnimation}
                  loop={true}
                  autoplay={true}
                  className="w-full h-[65%] object-cover opacity-20"
                />
              </div>

              <div
                style={{
                  backgroundImage: 'url(/hero.svg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
                className="relative z-10 text-center flex flex-col justify-start items-center min-h-[700px] sm:min-h-[800px] px-4 max-w-7xl mx-auto w-full pt-8 sm:pt-12"
              >
                <motion.h1
                  className="text-3xl sm:text-6xl font-bold text-gray-900 mb-6"
                  variants={itemVariants}
                  initial="hidden"
                  animate={showContent ? 'visible' : 'hidden'}
                >
                  Welcome to <span className="text-blue-600">Viargos</span>
                </motion.h1>

                <motion.p
                  className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed"
                  variants={itemVariants}
                  initial="hidden"
                  animate={showContent ? 'visible' : 'hidden'}
                >
                  The ultimate travel companion for planning journeys, sharing
                  experiences, and discovering amazing destinations with a
                  global community of travelers.
                </motion.p>

                <motion.div
                  className="flex flex-row gap-3 sm:gap-4 justify-center items-center"
                  variants={itemVariants}
                  initial="hidden"
                  animate={showContent ? 'visible' : 'hidden'}
                >
                  <motion.button
                    onClick={openSignup}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="px-4 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-sm sm:text-lg shadow-lg cursor-pointer"
                  >
                    Start Your Journey
                  </motion.button>

                  <motion.button
                    onClick={openLogin}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="px-4 py-3 sm:px-8 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold text-sm sm:text-lg cursor-pointer"
                  >
                    Sign In
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <ModalContainer />
    </ErrorBoundary>
  );
}
