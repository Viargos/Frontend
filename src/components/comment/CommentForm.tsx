'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth.store';
import { X, Send } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  initialValue?: string;
  isSubmitting?: boolean;
  autoFocus?: boolean;
  replyingTo?: string; // Username being replied to
  showAvatar?: boolean;
  compact?: boolean; // For inline reply forms
}

export default function CommentForm({
  onSubmit,
  onCancel,
  placeholder = 'Write a comment...',
  initialValue = '',
  isSubmitting = false,
  autoFocus = false,
  replyingTo,
  showAvatar = true,
  compact = false,
}: CommentFormProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState(initialValue);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxLength = 1000;
  const remainingChars = maxLength - content.length;

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setError('Comment cannot be empty');
      return;
    }

    if (trimmedContent.length > maxLength) {
      setError(`Comment must be less than ${maxLength} characters`);
      return;
    }

    try {
      await onSubmit(trimmedContent);
      setContent('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit comment');
    }
  };

  const handleCancel = () => {
    setContent(initialValue);
    setError('');
    onCancel?.();
  };

  if (!user) {
    return null;
  }

  return (
    <motion.form
      initial={compact ? { opacity: 0, height: 0 } : { opacity: 1 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={compact ? { opacity: 0, height: 0 } : { opacity: 1 }}
      onSubmit={handleSubmit}
      className={compact ? 'ml-12 mb-2' : 'mb-4'}
    >
      {replyingTo && (
        <div className="mb-2 text-sm text-gray-600 flex items-center gap-2">
          <span>Replying to <span className="font-semibold text-blue-600">@{replyingTo}</span></span>
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        {showAvatar && (
          <div className="flex-shrink-0">
            {user.profileImage ? (
              <Image
                src={user.profileImage}
                alt={user.username || 'You'}
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
        )}

        {/* Input area */}
        <div className="flex-1">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              disabled={isSubmitting}
              maxLength={maxLength}
              rows={compact ? 2 : 3}
              className={`w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg resize-none
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:bg-gray-50 disabled:cursor-not-allowed
                transition-colors duration-200
                text-sm text-gray-900 placeholder-gray-500
                ${error ? 'border-red-300 focus:ring-red-500' : ''}
              `}
            />
            {/* Submit button inside textarea - bottom right */}
            <button
              type="submit"
              disabled={isSubmitting || !content.trim() || remainingChars < 0}
              className="absolute bottom-2 right-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              aria-label="Send comment"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Error and character counter */}
          {(error || remainingChars < 100) && (
            <div className="flex items-center justify-between mt-1">
              <div className="flex-1">
                {error && (
                  <p className="text-xs text-red-600">{error}</p>
                )}
              </div>
              {remainingChars < 100 && (
                <span
                  className={`text-xs ${
                    remainingChars < 0
                      ? 'text-red-600 font-medium'
                      : 'text-orange-600'
                  }`}
                >
                  {remainingChars}
                </span>
              )}
            </div>
          )}

          {/* Cancel button (only for edit/reply modes) */}
          {onCancel && (
            <div className="mt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.form>
  );
}
