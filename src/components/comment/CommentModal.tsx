'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { Post, PostComment } from '@/types/post.types';
import { postService } from '@/lib/services/service-factory';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onCommentCountChange?: (postId: string, newCount: number) => void;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CommentModal({
  isOpen,
  onClose,
  post,
  onCommentCountChange,
}: CommentModalProps) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(post.commentCount);

  // Fetch comments when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchComments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await postService.getComments(post.id, {
          limit: 10,
          offset: 0,
        });
        setComments(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comments');
        console.error('Error fetching comments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [isOpen, post.id]);

  // Handle adding a new comment
  const handleAddComment = async (content: string) => {
    setIsAddingComment(true);
    try {
      const newComment = await postService.addComment(post.id, content);

      // Optimistically add the comment to the list
      if (newComment.data) {
        setComments((prev) => [newComment.data, ...prev]);
        const newCount = localCommentCount + 1;
        setLocalCommentCount(newCount);
        onCommentCountChange?.(post.id, newCount);
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      throw err; // Let CommentForm handle the error display
    } finally {
      setIsAddingComment(false);
    }
  };

  // Handle comments update from CommentList
  const handleCommentsUpdate = (updatedComments: PostComment[]) => {
    setComments(updatedComments);
  };

  // Handle comment count change from CommentList (e.g., after delete)
  const handleCommentCountUpdate = (newCount: number) => {
    setLocalCommentCount(newCount);
    onCommentCountChange?.(post.id, newCount);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Comments
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({localCommentCount})
                  </span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Post info */}
            <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                {post.user.profileImage ? (
                  <Image
                    src={post.user.profileImage}
                    alt={post.user.username}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#001A6E] flex items-center justify-center text-white font-bold text-xs">
                    {post.user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {post.user.username}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {post.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Comment form */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <CommentForm
                onSubmit={handleAddComment}
                placeholder="Write a comment..."
                isSubmitting={isAddingComment}
              />
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <LoadingSkeleton />
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <p className="text-red-500 text-center mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <CommentList
                  postId={post.id}
                  comments={comments}
                  onCommentsUpdate={handleCommentsUpdate}
                  onCommentCountChange={handleCommentCountUpdate}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
