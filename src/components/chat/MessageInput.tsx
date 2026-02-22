'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea with max height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120); // Max 120px height
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [messageInput]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = messageInput.trim();

    if (!trimmedContent || isSending) {
      return;
    }

    // WhatsApp-like UX: Clear input IMMEDIATELY
    setMessageInput('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Send message in background (optimistic update handles UI)
    setIsSending(true);
    onSendMessage(trimmedContent);

    // Reset sending state after a short delay (prevents double-send)
    setTimeout(() => {
      setIsSending(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const hasContent = messageInput.trim().length > 0;

  return (
    <div className="flex-shrink-0 sticky bottom-0 z-10 bg-white border-t border-gray-100">
      {/* Safe area padding for mobile devices */}
      <div className="px-3 py-2 sm:px-4 sm:py-3">
        <form
          onSubmit={handleSendMessage}
          className={`flex items-end gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-full border-2 transition-all duration-200 ${
            isFocused 
              ? 'border-primary-blue bg-white shadow-lg' 
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          {/* Input Container */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Type a message..."
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-transparent border-0 focus:ring-0 focus:outline-none resize-none text-gray-900 placeholder-gray-400 leading-tight"
              rows={1}
              disabled={isSending}
              style={{ maxHeight: '120px' }}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!hasContent || isSending}
            className={`flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-200 ${
              hasContent && !isSending
                ? 'bg-[#160E53] text-white shadow-md hover:bg-[#241A7A] hover:shadow-lg active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSending ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5 rotate-45" />
            )}
          </button>
        </form>

        {/* Hint text - Desktop only */}
        <p className="hidden sm:block text-[10px] text-gray-400 text-center mt-1.5">
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>

      {/* Extra safe area for iOS devices */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </div>
  );
}
