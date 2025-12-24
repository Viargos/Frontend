"use client";

import { motion } from "framer-motion";
import DashboardPostsList from "@/components/dashboard/DashboardPostsList";

/**
 * Dashboard Page - Main authenticated user dashboard
 * This page is automatically wrapped by the DashboardLayout
 * which handles authentication and provides the AuthenticatedLayout
 */
export default function DashboardPage() {
  return (
    <motion.div 
      className="flex-1 p-4 sm:p-6 w-full flex justify-center min-h-[calc(100vh-200px)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="w-full max-w-6xl flex flex-col min-h-full">
        {/* Posts Feed with staggered animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex justify-center items-center flex-1 w-full"
        >
          <DashboardPostsList />
        </motion.div>
      </div>
    </motion.div>
  );
}
