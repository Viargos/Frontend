"use client";

import { motion } from "framer-motion";

interface AnimatedHamburgerProps {
    isOpen: boolean;
    onClick: () => void;
    className?: string;
}

export default function AnimatedHamburger({
    isOpen,
    onClick,
    className = "",
}: AnimatedHamburgerProps) {
    return (
        <motion.button
            onClick={onClick}
            className={`lg:hidden flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer ${className}`}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <div className="w-5 h-5 flex flex-col justify-center items-center">
                {/* Top line */}
                <motion.div
                    className="w-4 h-0.5 bg-current mb-1"
                    animate={{
                        rotate: isOpen ? 45 : 0,
                        y: isOpen ? 6 : 0,
                        width: isOpen ? 16 : 16,
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                />

                {/* Middle line */}
                <motion.div
                    className="w-4 h-0.5 bg-current mb-1"
                    animate={{
                        opacity: isOpen ? 0 : 1,
                        x: isOpen ? -10 : 0,
                    }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                />

                {/* Bottom line */}
                <motion.div
                    className="w-4 h-0.5 bg-current"
                    animate={{
                        rotate: isOpen ? -45 : 0,
                        y: isOpen ? -6 : 0,
                        width: isOpen ? 16 : 16,
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                />
            </div>
        </motion.button>
    );
}
