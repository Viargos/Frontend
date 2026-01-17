'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PostComment } from '@/types/post.types';
import { postService } from '@/lib/services/service-factory';
import { CommentItem, CommentForm } from '@/components/comment';
import { Button } from '@/components/ui';
import { MessageSquare, Loader2 } from 'lucide-react';

interface CommentListProps {
  postId: string;
  comments: PostComment[];
  onCommentsUpdate?: (comments: PostComment[]) => void;
  onCommentCountChange?: (newCount: number) => void;
}

interface ReplyState {
  commentId: string | null;
  parentComment: PostComment | null;
}

interface ExpandedReplies {
  [commentId: string]: PostComment[];
}

export default function CommentList({
  postId,
  comments: initialComments,
  onCommentsUpdate,
  onCommentCountChange,
}: CommentListProps) {
  const [comments, setComments] = useState<PostComment[]>(initialComments);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [replyState, setReplyState] = useState<ReplyState>({
    commentId: null,
    parentComment: null,
  });
  const [expandedReplies, setExpandedReplies] = useState<ExpandedReplies>({});
  const [loadingReplies, setLoadingReplies] = useState<string | null>(null);

  const limit = 10;

  // Update local state when prop changes
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // Load more comments
  const handleLoadMore = async () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const response = await postService.getComments(postId, {
        limit,
        offset: page * limit,
      });

      const newComments = response.data || [];
      const updatedComments = [...comments, ...newComments];
      setComments(updatedComments);
      setPage(page + 1);
      setHasMore(newComments.length === limit);
      onCommentsUpdate?.(updatedComments);
    } catch (error) {
      console.error('Failed to load more comments:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (content: string) => {
    if (!replyState.parentComment) return;

    await postService.addComment(postId, content, replyState.parentComment.id);

    // Refresh comments or add optimistically
    const response = await postService.getComments(postId, { limit: page * limit });
    const updatedComments = response.data || [];
    setComments(updatedComments);
    onCommentsUpdate?.(updatedComments);
    onCommentCountChange?.(updatedComments.length);

    // Update reply count on parent comment
    const updatedParent = updatedComments.find(c => c.id === replyState.parentComment!.id);
    if (updatedParent) {
      setComments(prev =>
        prev.map(c => (c.id === updatedParent.id ? updatedParent : c))
      );
    }

    // Cancel reply mode
    setReplyState({ commentId: null, parentComment: null });
  };

  // Handle view replies
  const handleViewReplies = async (comment: PostComment) => {
    const commentId = comment.id;

    // If already expanded, collapse
    if (expandedReplies[commentId]) {
      setExpandedReplies(prev => {
        const updated = { ...prev };
        delete updated[commentId];
        return updated;
      });
      return;
    }

    // Load replies
    setLoadingReplies(commentId);
    try {
      const response = await postService.getReplies(commentId, { limit: 50 });
      const replies = response.data || [];
      setExpandedReplies(prev => ({ ...prev, [commentId]: replies }));
    } catch (error) {
      console.error('Failed to load replies:', error);
    } finally {
      setLoadingReplies(null);
    }
  };

  // Handle reply button click
  const handleReply = (comment: PostComment) => {
    setReplyState({ commentId: comment.id, parentComment: comment });
    setEditState({ commentId: null, content: '' });
  };

  // Cancel reply
  const handleCancelReply = () => {
    setReplyState({ commentId: null, parentComment: null });
  };

  // Empty state
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No comments yet
        </h3>
        <p className="text-gray-500 text-center text-sm">
          Be the first to share your thoughts!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <AnimatePresence mode="popLayout">
        {comments.map((comment) => (
          <div key={comment.id}>
            {/* Main comment */}
            <CommentItem
              comment={comment}
              onReply={handleReply}
              onViewReplies={handleViewReplies}
              depth={0}
            />

            {/* Reply form */}
            {replyState.commentId === comment.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-12 mt-2"
              >
                <CommentForm
                  onSubmit={handleReplySubmit}
                  onCancel={handleCancelReply}
                  placeholder={`Reply to ${comment.user.username}...`}
                  replyingTo={comment.user.username}
                  autoFocus
                  compact
                />
              </motion.div>
            )}

            {/* Nested replies */}
            {expandedReplies[comment.id] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-6 border-l-2 border-gray-200 pl-2"
              >
                {expandedReplies[comment.id].map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    depth={1}
                  />
                ))}
              </motion.div>
            )}

            {/* Loading replies indicator */}
            {loadingReplies === comment.id && (
              <div className="ml-12 flex items-center gap-2 text-sm text-gray-500 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading replies...
              </div>
            )}
          </div>
        ))}
      </AnimatePresence>

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center pt-4 pb-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            loading={isLoadingMore}
          >
            Load more comments
          </Button>
        </div>
      )}
    </div>
  );
}
