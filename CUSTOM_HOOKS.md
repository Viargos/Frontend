# Custom Hooks Documentation

This document provides comprehensive documentation for all custom hooks in the Viargos application.

## Overview

Custom hooks provide reusable stateful logic that can be shared across components. They follow the React hooks naming convention (prefixed with `use`) and allow us to extract component logic into reusable functions.

## Available Custom Hooks

### 1. useClickOutside

**Location**: `src/hooks/useClickOutside.ts`

Handles clicks outside of a referenced element. Perfect for dropdowns, modals, tooltips, etc.

```tsx
import { useClickOutside } from '@/hooks/useClickOutside';

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setIsOpen(false);
  });

  return (
    <div ref={dropdownRef}>
      {/* Dropdown content */}
    </div>
  );
}
```

**API:**
- `useClickOutside<T>(handler, listenCapturing?)` - Returns a ref to attach to the element
- `useClickOutsideMultiple(refs[], handler, listenCapturing?)` - For multiple refs

### 2. useBodyScrollLock

**Location**: `src/hooks/useBodyScrollLock.ts`

Locks and unlocks body scroll, useful for modals and overlays.

```tsx
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

function Modal({ isOpen }) {
  // Locks body scroll when modal is open
  useBodyScrollLock(isOpen);
  
  return isOpen ? <div>Modal content</div> : null;
}
```

**Variants:**
- `useBodyScrollLock(isLocked)` - Advanced with position restoration
- `useSimpleBodyScrollLock(isLocked)` - Just toggles overflow hidden
- `useAdvancedBodyScrollLock(isLocked, restorePosition)` - Mobile Safari support

### 3. useKeyboardShortcut

**Location**: `src/hooks/useKeyboardShortcut.ts`

Handles keyboard shortcuts and key combinations.

```tsx
import { 
  useKeyboardShortcut, 
  useEscapeKey, 
  useKeyboardCombo,
  useCommonShortcuts 
} from '@/hooks/useKeyboardShortcut';

function Editor() {
  // Simple key handler
  useKeyboardShortcut('enter', handleSubmit);
  
  // Escape key specifically
  useEscapeKey(() => setMode('view'));
  
  // Key combinations
  useKeyboardCombo(
    { key: 's', ctrl: true },
    handleSave,
    { preventDefault: true }
  );
  
  // Common shortcuts
  useCommonShortcuts({
    onSave: handleSave,
    onCancel: handleCancel,
    onCopy: handleCopy
  });
}
```

### 4. useDebounce

**Location**: `src/hooks/useDebounce.ts`

Debounces values and callbacks to limit function calls.

```tsx
import { 
  useDebounce, 
  useDebouncedCallback,
  useSearchDebounce 
} from '@/hooks/useDebounce';

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounce the search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Or debounce a callback
  const debouncedSearch = useDebouncedCallback(
    (term) => fetchSearchResults(term),
    300
  );
  
  // Or use search-specific hook
  useSearchDebounce(
    searchTerm,
    fetchSearchResults,
    300, // delay
    2    // min length
  );
}
```

### 5. useFileUpload

**Location**: `src/hooks/useFileUpload.ts`

Comprehensive file upload handling with drag-and-drop support.

```tsx
import { useFileUpload, useImageUpload } from '@/hooks/useFileUpload';

function FileUploader() {
  const {
    files,
    isDragOver,
    isUploading,
    errors,
    addFiles,
    removeFile,
    uploadFiles,
    getDragHandlers,
    getInputProps
  } = useFileUpload({
    accept: ['.jpg', '.png', '.pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    onError: (error) => toast.error(error)
  });

  const handleUpload = () => {
    uploadFiles(async (files) => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      return await api.uploadFiles(formData);
    });
  };

  return (
    <div {...getDragHandlers()}>
      <input type="file" {...getInputProps()} />
      {files.map((file, index) => (
        <div key={index}>
          {file.name}
          <button onClick={() => removeFile(index)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

// For images with previews
function ImageUploader() {
  const { files, previews, addFiles } = useImageUpload();
  
  return (
    <div>
      {files.map((file, index) => (
        <img key={index} src={previews[file.name]} alt={file.name} />
      ))}
    </div>
  );
}
```

### 6. useApi

**Location**: `src/hooks/useApi.ts`

API calls with loading states, error handling, and retry logic.

```tsx
import { useApi, useApiWithParams, useInfiniteApi } from '@/hooks/useApi';

function UserProfile({ userId }) {
  // Simple API call
  const { data: user, loading, error, execute } = useApi(
    () => fetchUser(userId),
    {
      immediate: true,
      onSuccess: (user) => setTitle(`Profile - ${user.name}`),
      onError: (error) => toast.error(error),
      retryCount: 3
    }
  );

  // API with parameters
  const { data: posts, execute: fetchPosts } = useApiWithParams(
    (params) => fetchUserPosts(userId, params)
  );

  // Infinite scrolling
  const {
    data: items,
    loading,
    hasMore,
    loadMore
  } = useInfiniteApi(
    (page, pageSize) => fetchItems(page, pageSize),
    20,
    { immediate: true }
  );

  return (
    <div>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      {user && <UserCard user={user} />}
    </div>
  );
}
```

### 7. useWindowSize

**Location**: `src/hooks/useWindowSize.ts`

Window size tracking and responsive breakpoint detection.

```tsx
import { 
  useWindowSize, 
  useBreakpoint,
  useMediaQuery,
  useTailwindBreakpoints,
  useIsTouchDevice 
} from '@/hooks/useWindowSize';

function ResponsiveComponent() {
  const { width, height, isMobile, isTablet, isDesktop } = useWindowSize();
  
  const isLargeScreen = useBreakpoint(1200);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const { sm, md, lg } = useTailwindBreakpoints();
  const isTouchDevice = useIsTouchDevice();

  return (
    <div>
      <p>Screen: {width}x{height}</p>
      {isMobile && <MobileNav />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
      {isTouchDevice && <TouchOptimizedControls />}
    </div>
  );
}
```

### 8. useErrorHandler

**Location**: `src/hooks/useErrorHandler.ts`

Error handling that works with ErrorBoundary.

```tsx
import { useErrorHandler, withErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { error, hasError, throwError, captureError, clearError } = useErrorHandler();

  const handleRiskyOperation = async () => {
    try {
      await riskyApiCall();
    } catch (error) {
      // Option 1: Capture error locally
      captureError(error);
      
      // Option 2: Throw to ErrorBoundary
      throwError(error);
    }
  };

  if (hasError) {
    return (
      <div>
        <p>Error: {error?.message}</p>
        <button onClick={clearError}>Try Again</button>
      </div>
    );
  }

  return <div>Normal content</div>;
}

// Or use as HOC
const SafeComponent = withErrorHandler(MyComponent, CustomErrorFallback);
```

### 9. useAuthModals

**Location**: `src/hooks/useAuthModals.ts`

Authentication modal state management (already exists in your project).

```tsx
import { useAuthModals } from '@/hooks/useAuthModals';

function LoginButton() {
  const { switchToLogin, switchToSignup, closeAll } = useAuthModals();
  
  return (
    <div>
      <button onClick={switchToLogin}>Login</button>
      <button onClick={switchToSignup}>Sign Up</button>
    </div>
  );
}
```

## Usage Patterns

### Combining Hooks

```tsx
function SearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const modalRef = useClickOutside(onClose);
  
  useBodyScrollLock(isOpen);
  useEscapeKey(onClose, isOpen);
  
  const { data: results, loading } = useApiWithParams(
    (term) => searchApi(term)
  );
  
  const debouncedSearch = useDebouncedCallback(
    (term) => results.execute({ term }),
    300
  );
  
  useEffect(() => {
    if (searchTerm.length >= 2) {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div ref={modalRef} className="modal">
        <SearchInput 
          value={searchTerm}
          onChange={setSearchTerm}
        />
        {loading && <LoadingSpinner />}
        <SearchResults results={results.data} />
      </div>
    </div>
  );
}
```

### Creating Composite Hooks

```tsx
// Custom hook that combines multiple hooks
function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  
  const modalRef = useClickOutside(() => setIsOpen(false));
  useBodyScrollLock(isOpen);
  useEscapeKey(() => setIsOpen(false), isOpen);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return {
    isOpen,
    modalRef,
    open,
    close,
    toggle
  };
}

// Usage
function MyComponent() {
  const modal = useModal();
  
  return (
    <div>
      <button onClick={modal.open}>Open Modal</button>
      {modal.isOpen && (
        <div ref={modal.modalRef}>
          Modal content
          <button onClick={modal.close}>Close</button>
        </div>
      )}
    </div>
  );
}
```

## Best Practices

1. **Keep hooks focused**: Each hook should have a single responsibility
2. **Use TypeScript**: Provide proper types for better developer experience
3. **Handle cleanup**: Always clean up event listeners and subscriptions
4. **Use useCallback and useMemo**: Optimize performance when necessary
5. **Test your hooks**: Write tests for complex hook logic
6. **Document dependencies**: Clearly document what each hook depends on

## Testing Custom Hooks

```tsx
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

test('useDebounce should debounce values', async () => {
  const { result, rerender } = renderHook(
    ({ value, delay }) => useDebounce(value, delay),
    { initialProps: { value: 'initial', delay: 500 } }
  );

  expect(result.current).toBe('initial');

  rerender({ value: 'updated', delay: 500 });
  expect(result.current).toBe('initial'); // Still old value

  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
  });

  expect(result.current).toBe('updated'); // Now updated
});
```

This comprehensive set of custom hooks provides reusable, well-tested solutions for common React patterns, making your codebase more maintainable and consistent.
