"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export interface TabConfig {
    id: string;
    label: string;
    content: ReactNode;
}

interface TabsProps {
    tabs: TabConfig[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
}

export default function Tabs({
    tabs,
    activeTab,
    onTabChange,
    className = "",
}: TabsProps) {
    return (
        <div className={`w-full ${className}`}>
            {/* Tab Headers */}
            <motion.div
                className="flex items-center gap-8 w-full border-b border-gray-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {tabs.map((tab, index) => (
                    <motion.button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`pb-3 px-1 border-b-2 font-medium transition-colors relative cursor-pointer ${
                            activeTab === tab.id
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                    >
                        {tab.label}

                        {/* Active indicator */}
                        {activeTab === tab.id && (
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                                layoutId="activeTab"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                }}
                            />
                        )}
                    </motion.button>
                ))}
            </motion.div>

            {/* Tab Content */}
            <motion.div
                className="mt-6"
                key={activeTab} // This ensures content re-animates when tab changes
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {tabs.find((tab) => tab.id === activeTab)?.content}
            </motion.div>
        </div>
    );
}
