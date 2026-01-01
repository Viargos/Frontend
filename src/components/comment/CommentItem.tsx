'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { PostComment } from '@/types/post.types';
import { useAuthStore } from '@/store/auth.store';
import { Reply } from 'lucide-react';

interface CommentItemProps {
  comment: PostComment;
  onReply?: (comment: PostComment) => void;
  onViewReplies?: (comment: PostComment) => void;
  depth?: number; // For nested comments (0 = top level, 1 = reply, etc.)
}

export default function CommentItem({
  comment,
  onReply,
  onViewReplies,
  depth = 0,
}: CommentItemProps) {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();

  const hasReplies = comment.replyCount > 0;

  // Limit nesting depth for visual hierarchy
  const indentLevel = Math.min(depth, 3);
  const indentClass = indentLevel > 0 ? `ml-${indentLevel * 4} sm:ml-${indentLevel * 6}` : '';

  const handleUserClick = () => {
    if (comment.user.id === currentUser?.id) {
      router.push('/profile');
    } else {
      router.push(`/user/${comment.user.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors ${indentClass}`}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 cursor-pointer"
        onClick={handleUserClick}
      >
        {comment.user.profileImage ? (
          <Image
            src={comment.user.profileImage}
            alt={comment.user.username || 'User'}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {comment.user.username?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* User info and timestamp */}
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={handleUserClick}
            className="font-semibold text-sm text-gray-900 hover:underline"
          >
            {comment.user.username}
          </button>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        {/* Comment text */}
        <p className="text-sm text-gray-800 leading-relaxed mb-2 whitespace-pre-wrap break-words">
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Reply button */}
          {depth < 2 && onReply && (
            <button
              onClick={() => onReply(comment)}
              className="text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <Reply className="w-3 h-3" />
              Reply
            </button>
          )}

          {/* View replies button */}
          {hasReplies && onViewReplies && (
            <button
              onClick={() => onViewReplies(comment)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
