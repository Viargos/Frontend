"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Post } from "@/types/post.types";
import GuestCompactPostCard from "./GuestCompactPostCard";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";

interface GuestPostsListProps {
    className?: string;
    maxPosts?: number;
}

// Static mock data for demo purposes
const STATIC_POSTS: Post[] = [
    {
        id: "1",
        description:
            "Just visited the amazing Eiffel Tower! The view from the top is absolutely breathtaking. Paris never fails to amaze me with its beauty and charm. 🗼✨",
        location: "Paris, France",
        likeCount: 42,
        commentCount: 8,
        isLikedByCurrentUser: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        user: {
            id: "user1",
            username: "traveler_sarah",
            profileImage: "/avatar.png",
        },
        media: [
            {
                id: "media1",
                type: "image",
                url: "/travel-sample/1.jpg",
                thumbnailUrl: "/travel-sample/1.jpg",
            },
        ],
        journey: {
            id: "journey1",
            title: "Paris Adventure - 3 Days",
        },
    },
    {
        id: "2",
        description:
            "Exploring the vibrant streets of London! From Big Ben to the London Eye, every corner tells a story. The perfect blend of history and modernity. 🇬🇧",
        location: "London, UK",
        likeCount: 28,
        commentCount: 5,
        isLikedByCurrentUser: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        user: {
            id: "user2",
            username: "london_explorer",
            profileImage: "/avatar.png",
        },
        media: [
            {
                id: "media2",
                type: "image",
                url: "/travel-sample/2.jpg",
                thumbnailUrl: "/travel-sample/2.jpg",
            },
        ],
        journey: {
            id: "journey2",
            title: "London Discovery Tour",
        },
    },
    {
        id: "3",
        description:
            "Sunset at the beach was absolutely magical today. Sometimes the simplest moments create the most beautiful memories. Nature's artwork at its finest! 🌅",
        location: "Malibu, California",
        likeCount: 67,
        commentCount: 12,
        isLikedByCurrentUser: false,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        user: {
            id: "user3",
            username: "beach_wanderer",
            profileImage: "/avatar.png",
        },
        media: [
            {
                id: "media3",
                type: "image",
                url: "/travel-sample/3.jpg",
                thumbnailUrl: "/travel-sample/3.jpg",
            },
        ],
    },
    {
        id: "4",
        description:
            "Mountain hiking adventure complete! The trail was challenging but the panoramic views from the summit made every step worth it. Nature therapy at its best! 🏔️",
        location: "Swiss Alps, Switzerland",
        likeCount: 35,
        commentCount: 7,
        isLikedByCurrentUser: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        user: {
            id: "user4",
            username: "mountain_climber",
            profileImage: "/avatar.png",
        },
        media: [
            {
                id: "media4",
                type: "image",
                url: "/travel-sample/4.jpg",
                thumbnailUrl: "/travel-sample/4.jpg",
            },
        ],
        journey: {
            id: "journey3",
            title: "Alpine Adventure",
        },
    },
    {
        id: "5",
        description:
            "Food tour in Tokyo was incredible! From authentic ramen to fresh sushi, every bite was a culinary adventure. Japanese cuisine is truly an art form. 🍜🍣",
        location: "Tokyo, Japan",
        likeCount: 89,
        commentCount: 15,
        isLikedByCurrentUser: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        user: {
            id: "user5",
            username: "foodie_adventures",
            profileImage: "/avatar.png",
        },
        media: [
            {
                id: "media5",
                type: "image",
                url: "/travel-sample/5.jpg",
                thumbnailUrl: "/travel-sample/5.jpg",
            },
        ],
        journey: {
            id: "journey4",
            title: "Tokyo Food Discovery",
        },
    },
    {
        id: "6",
        description:
            "Ancient history comes alive in Rome! Walking through the Colosseum and Roman Forum feels like traveling back in time. Every stone has a story to tell. 🏛️",
        location: "Rome, Italy",
        likeCount: 53,
        commentCount: 9,
        isLikedByCurrentUser: false,
        createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
        user: {
            id: "user6",
            username: "history_buff",
            profileImage: "/avatar.png",
        },
        media: [
            {
                id: "media6",
                type: "image",
                url: "/travel-sample/6.jpg",
                thumbnailUrl: "/travel-sample/6.jpg",
            },
        ],
        journey: {
            id: "journey5",
            title: "Roman Empire Tour",
        },
    },
];

export default function GuestPostsList({
    className = "",
    maxPosts = 10,
}: GuestPostsListProps) {
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const { openLogin, openSignup } = useAuthStore();

    // Use static posts data, limited by maxPosts
    const posts = STATIC_POSTS.slice(0, maxPosts);

    const handleJourneyClick = (journeyId: string) => {
        // For guests, show auth prompt when trying to view journey
        setShowAuthPrompt(true);
    };

    const handleCommentClick = (postId: string) => {
        // For guests, show auth prompt when trying to comment
        setShowAuthPrompt(true);
    };

    const handleLikeChange = (
        postId: string,
        isLiked: boolean,
        newCount: number
    ) => {
        // For guests, show auth prompt when trying to like
        setShowAuthPrompt(true);
    };

    if (posts.length === 0) {
        return (
            <div className={`text-center py-12 ${className}`}>
                <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No posts available
                </h3>
                <p className="text-gray-500 mb-4">
                    Join Viargos to start sharing your travel experiences!
                </p>
                <div className="flex justify-center space-x-4">
                    <Button variant="primary" onClick={openSignup}>
                        Sign Up
                    </Button>
                    <Button variant="secondary-color" onClick={openLogin}>
                        Sign In
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Posts List */}
            <AnimatePresence>
                {posts.map((post, index) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                        <GuestCompactPostCard
                            post={post}
                            onLikeChange={handleLikeChange}
                            onCommentClick={handleCommentClick}
                            onJourneyClick={handleJourneyClick}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Auth Prompt */}
            <AnimatePresence>
                {showAuthPrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 text-center"
                    >
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Want to see more?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Join Viargos to discover unlimited travel
                                experiences, share your own journeys, and
                                connect with fellow travelers!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    variant="primary"
                                    onClick={openSignup}
                                    className="flex-1 sm:flex-none"
                                >
                                    Sign Up Free
                                </Button>
                                <Button
                                    variant="secondary-color"
                                    onClick={openLogin}
                                    className="flex-1 sm:flex-none"
                                >
                                    Sign In
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-4">
                                Or continue exploring our{" "}
                                <button
                                    onClick={() =>
                                        (window.location.href = "/explore")
                                    }
                                    className="text-blue-600 hover:text-blue-700 underline"
                                >
                                    Explore page
                                </button>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Post Limit Reached */}
            {posts.length >= maxPosts && !showAuthPrompt && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center"
                >
                    <h4 className="font-medium text-gray-900 mb-2">
                        You&apos;ve reached the preview limit
                    </h4>
                    <p className="text-gray-600 text-sm mb-4">
                        Sign up to see unlimited posts and join the community!
                    </p>
                    <div className="flex justify-center space-x-3">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={openSignup}
                        >
                            Sign Up
                        </Button>
                        <Button
                            variant="secondary-color"
                            size="sm"
                            onClick={openLogin}
                        >
                            Sign In
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
