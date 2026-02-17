/**
 * Chat UI Store (Zustand)
 *
 * ONLY manages UI state (not server data).
 * Server data (conversations, messages) is handled by React Query.
 *
 * This store handles:
 * - Selected chat user
 * - Chat window open/closed state
 * - Search/filter UI state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatUser } from '@/types/chat.types';

interface ChatUIState {
  // Selected chat user
  selectedChatId: string | null;
  selectedChatUser: ChatUser | null;

  // UI state
  isChatWindowOpen: boolean;
  searchQuery: string;

  // Actions
  setSelectedChat: (user: ChatUser | null) => void;
  clearSelectedChat: () => void;
  setSearchQuery: (query: string) => void;
  toggleChatWindow: () => void;
  openChatWindow: () => void;
  closeChatWindow: () => void;
  reset: () => void;
}

const initialState = {
  selectedChatId: null,
  selectedChatUser: null,
  isChatWindowOpen: false,
  searchQuery: '',
};

export const useChatUIStore = create<ChatUIState>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedChat: (user) => {
        set({
          selectedChatId: user?.id || null,
          selectedChatUser: user,
          isChatWindowOpen: !!user, // Auto-open when selecting chat
        });
      },

      clearSelectedChat: () => {
        set({
          selectedChatId: null,
          selectedChatUser: null,
        });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      toggleChatWindow: () => {
        set((state) => ({
          isChatWindowOpen: !state.isChatWindowOpen,
        }));
      },

      openChatWindow: () => {
        set({ isChatWindowOpen: true });
      },

      closeChatWindow: () => {
        set({ isChatWindowOpen: false });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'chat-ui-store',
      partialize: (state) => ({
        // Only persist selected chat (for reopening after refresh)
        selectedChatId: state.selectedChatId,
        selectedChatUser: state.selectedChatUser,
      }),
    }
  )
);
