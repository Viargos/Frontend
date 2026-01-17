'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post, PostComment } from '@/types/post.types';
import { postService } from '@/lib/services/service-factory';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

interface CommentSectionProps {
  post: Post;
  isOpen: boolean;
  onCommentCountChange?: (postId: string, newCount: number) => void;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CommentSection({
  post,
  isOpen,
  onCommentCountChange,
}: CommentSectionProps) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(post.commentCount);
  const [showAllComments, setShowAllComments] = useState(false);

  // Fetch comments when section opens
  useEffect(() => {
    if (!isOpen) {
      // Reset to show only 2 comments when closed
      setShowAllComments(false);
      return;
    }

    const fetchComments = async () => {
      setIsLoading(true);

      try {
        const response = await postService.getComments(post.id, {
          limit: 10,
          offset: 0,
        });
        setComments(response.data || []);
      } catch (err) {
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

  // Handle comment count change from CommentList
  const handleCommentCountUpdate = (newCount: number) => {
    setLocalCommentCount(newCount);
    onCommentCountChange?.(post.id, newCount);
  };

  // Get the comments to display (last 2 or all)
  const displayedComments = showAllComments ? comments : comments.slice(0, 2);
  const hasMoreComments = comments.length > 2;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="border-t border-gray-200 bg-gray-50 overflow-hidden"
        >
          <div className="px-4 py-3">
            {/* Comment Form */}
            <div className="mb-4">
              <CommentForm
                onSubmit={handleAddComment}
                placeholder="Add a comment..."
                isSubmitting={isAddingComment}
              />
            </div>

            {/* View all comments link */}
            {!showAllComments && hasMoreComments && !isLoading && (
              <button
                onClick={() => setShowAllComments(true)}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium mb-3"
              >
                View all {localCommentCount} comments
              </button>
            )}

            {/* Comments List */}
            <div className="bg-white rounded-lg">
              {isLoading ? (
                <LoadingSkeleton />
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <p className="text-gray-500 text-sm">No comments yet</p>
                  <p className="text-gray-400 text-xs mt-1">Be the first to comment!</p>
                </div>
              ) : (
                <CommentList
                  postId={post.id}
                  comments={displayedComments}
                  onCommentsUpdate={handleCommentsUpdate}
                  onCommentCountChange={handleCommentCountUpdate}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
