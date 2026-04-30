'use client';

import { useEffect, useRef, useState } from 'react';

type MessageComposerProps = {
  disabled?: boolean;
  onSubmit: (content: string) => Promise<void>;
};

export const MessageComposer = (props: MessageComposerProps) => {
  const { disabled, onSubmit } = props;
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = 'auto';
    const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
    textareaRef.current.style.height = `${newHeight}px`;
  }, [messageInput]);

  const sendCurrentMessage = async () => {
    const trimmedContent = messageInput.trim();

    if (!trimmedContent || disabled || isSending) {
      return;
    }

    setMessageInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsSending(true);

    try {
      await onSubmit(trimmedContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendCurrentMessage();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendCurrentMessage();
    }
  };

  const hasContent = messageInput.trim().length > 0;
  const formClassName = isFocused
    ? 'border-primary-blue bg-white shadow-lg'
    : 'border-gray-200 bg-gray-50';
  const sendButtonClassName = hasContent && !isSending
    ? 'bg-[#160E53] text-white shadow-md hover:bg-[#241A7A] hover:shadow-lg active:scale-95'
    : 'bg-gray-200 text-gray-400 cursor-not-allowed';

  return (
    <div className="sticky bottom-0 z-10 flex-shrink-0 border-t border-gray-100 bg-white">
      <div className="px-3 py-2 sm:px-4 sm:py-3">
        <form
          onSubmit={handleSubmit}
          className={`flex items-end gap-2 rounded-full border-2 p-1.5 transition-all duration-200 sm:gap-3 sm:p-2 ${formClassName}`}
        >
          <div className="min-w-0 flex-1">
            <textarea
              ref={textareaRef}
              value={messageInput}
              onChange={event => setMessageInput(event.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Type a message..."
              className="w-full resize-none border-0 bg-transparent px-3 py-2 text-sm leading-tight text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none sm:px-4 sm:py-2.5 sm:text-base"
              rows={1}
              disabled={disabled || isSending}
              style={{ maxHeight: '120px' }}
            />
          </div>

          <button
            aria-label="Send message"
            type="submit"
            disabled={!hasContent || disabled || isSending}
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 sm:h-11 sm:w-11 ${sendButtonClassName}`}
          >
            {isSending
              ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white sm:h-5 sm:w-5" />
                )
              : (
                  <span className="inline-flex h-4 w-4 rotate-45 items-center justify-center text-xs leading-none sm:h-5 sm:w-5">➤</span>
                )}
          </button>
        </form>

        <p className="mt-1.5 hidden text-center text-[10px] text-gray-400 sm:block">
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>
      <div className="h-safe-area-inset-bottom bg-white" />
    </div>
  );
};
