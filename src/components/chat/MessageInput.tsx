'use client';

import { useState, useRef, useEffect } from 'react';
import { SpinnerIcon, SendIcon } from '@/components/icons';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageInput]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = messageInput.trim();
    
    if (!trimmedContent || isSending) {
      return;
    }

    setIsSending(true);
    try {
      await onSendMessage(trimmedContent);
      setMessageInput('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0 sticky bottom-0 z-10">
      <form
        onSubmit={handleSendMessage}
        className="flex items-center space-x-3"
      >
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue resize-none bg-gray-50 focus:bg-white transition-colors text-gray-900 placeholder-gray-500 overflow-hidden"
            rows={1}
            disabled={isSending}
          />
        </div>
        <button
          type="submit"
          disabled={!messageInput.trim() || isSending}
          className="flex items-center justify-center w-12 h-12 bg-primary-blue text-white rounded-full hover:bg-blue-700 focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isSending ? (
            <SpinnerIcon className="w-5 h-5" />
          ) : (
            <SendIcon className="w-5 h-5 rotate-90" />
          )}
        </button>
      </form>
    </div>
  );
}
