'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui';
import { Post } from '@/types/post.types';
import PostCard from './PostCard';
import { CloseIcon } from '@/components/icons';

export interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onJourneyClick?: (journeyId: string) => void;
}

/**
 * PostDetailModal - Shows full post details in a modal
 * Used from profile grids to view post with all interactions
 */
export default function PostDetailModal({
  post,
  isOpen,
  onClose,
  onJourneyClick,
}: PostDetailModalProps) {
  if (!post) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <motion.div
        className="bg-white rounded-xl shadow-xl w-full relative max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Close button */}
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md bg-white/80 backdrop-blur-sm p-2"
          aria-label="Close post detail"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CloseIcon className="w-5 h-5" />
        </motion.button>

        {/* Post Content */}
        <div className="pt-2">
          <PostCard
            post={post}
            onJourneyClick={onJourneyClick}
            className="border-none shadow-none"
          />
        </div>
      </motion.div>
    </Modal>
  );
}
