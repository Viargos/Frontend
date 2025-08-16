// Custom Hooks Index
// This file exports all custom hooks for easier imports

import { useState } from 'react';
import { useClickOutside } from './useClickOutside';
import { useBodyScrollLock } from './useBodyScrollLock';
import { useEscapeKey } from './useKeyboardShortcut';

// Click outside detection
export { 
  useClickOutside, 
  useClickOutsideMultiple 
} from './useClickOutside';

// Body scroll lock
export { 
  useBodyScrollLock, 
  useSimpleBodyScrollLock, 
  useAdvancedBodyScrollLock 
} from './useBodyScrollLock';

// Keyboard shortcuts
export { 
  useKeyboardShortcut, 
  useEscapeKey, 
  useKeyboardCombo, 
  useCommonShortcuts 
} from './useKeyboardShortcut';

// Debouncing
export { 
  useDebounce, 
  useDebouncedCallback, 
  useDebounceWithCallback, 
  useAdvancedDebounce, 
  useSearchDebounce 
} from './useDebounce';

// File uploads
export { 
  useFileUpload, 
  useImageUpload 
} from './useFileUpload';

// API calls
export { 
  useApi, 
  useApiWithParams, 
  useInfiniteApi 
} from './useApi';

// Window and responsive
export { 
  useWindowSize, 
  useBreakpoint, 
  useMediaQuery, 
  useTailwindBreakpoints, 
  useIsTouchDevice, 
  useViewportSize 
} from './useWindowSize';

// Error handling
export { 
  useErrorHandler, 
  withErrorHandler, 
  handleAsyncError 
} from './useErrorHandler';

// Auth modals (already exists)
export { useAuthModals } from './useAuthModals';

// Re-export all hook types for convenience
export type { 
  UseFileUploadReturn, 
  UseApiState, 
  UseApiOptions 
} from './useFileUpload';

// Common hook combinations
export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  
  const modalRef = useClickOutside(() => setIsOpen(false));
  useBodyScrollLock(isOpen);
  useEscapeKey(() => setIsOpen(false), isOpen);
  
  return {
    isOpen,
    modalRef,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev)
  };
};

export const useDropdown = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  
  const dropdownRef = useClickOutside(() => setIsOpen(false));
  
  return {
    isOpen,
    dropdownRef,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev)
  };
};

export const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const setError = (name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const setTouched = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setError,
    setTouched,
    reset
  };
};
