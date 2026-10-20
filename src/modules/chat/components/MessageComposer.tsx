'use client';

import { SendHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CHAT_COPY } from '@/modules/chat/constants/chat-copy';

type MessageComposerProps = {
  disabled?: boolean;
  onSubmit: (content: string) => Promise<void>;
};

export const MessageComposer = (props: MessageComposerProps) => {
  const { disabled, onSubmit } = props;
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
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
  const sendButtonClassName = hasContent && !disabled && !isSending
    ? 'bg-primary-blue text-white hover:opacity-90'
    : 'cursor-not-allowed bg-[var(--surface-2)] text-[var(--text-muted)]';

  return (
    <div className="z-10 shrink-0 border-t border-[var(--border-subtle)] bg-[var(--surface-0)] pb-[env(safe-area-inset-bottom)]">
      <div className="px-4 py-3 sm:px-6">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 rounded-3xl border border-transparent bg-[var(--surface-1)] p-1.5 transition-colors focus-within:border-[var(--text-primary)] focus-within:bg-[var(--surface-0)] motion-reduce:transition-none"
        >
          <div className="min-w-0 flex-1">
            <textarea
              ref={textareaRef}
              value={messageInput}
              onChange={event => setMessageInput(event.target.value)}
              onKeyDown={handleKeyDown}
              aria-label={CHAT_COPY.messageLabel}
              placeholder={CHAT_COPY.messagePlaceholder}
              className="block w-full resize-none border-0 bg-transparent px-3 py-2.5 text-sm leading-5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-0 focus:outline-none"
              rows={1}
              disabled={disabled || isSending}
              style={{ maxHeight: '120px' }}
            />
          </div>

          <button
            aria-label={isSending ? CHAT_COPY.sendingMessage : CHAT_COPY.sendMessage}
            type="submit"
            disabled={!hasContent || disabled || isSending}
            className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)] motion-reduce:transition-none ${sendButtonClassName}`}
          >
            {isSending
              ? (
                  <div aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />
                )
              : (
                  <SendHorizontal aria-hidden="true" size={18} />
                )}
          </button>
        </form>

        <p className="mt-2 hidden text-center text-[10px] text-[var(--text-muted)] sm:block">
          {CHAT_COPY.keyboardHint}
        </p>
      </div>
    </div>
  );
};
