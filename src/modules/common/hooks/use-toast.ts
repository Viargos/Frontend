import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export const toast = {
  success: (message: string, description?: string, duration?: number) => {
    return useToastStore.getState().addToast({ type: 'success', message, description, duration });
  },
  error: (message: string, description?: string, duration?: number) => {
    return useToastStore.getState().addToast({ type: 'error', message, description, duration });
  },
  info: (message: string, description?: string, duration?: number) => {
    return useToastStore.getState().addToast({ type: 'info', message, description, duration });
  },
  warning: (message: string, description?: string, duration?: number) => {
    return useToastStore.getState().addToast({ type: 'warning', message, description, duration });
  },
};

export function useToast() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return {
    toasts,
    toast,
    dismiss: removeToast,
  };
}
