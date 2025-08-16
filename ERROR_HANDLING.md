# Error Handling System

This document explains the error handling system in the Viargos application, including the enhanced ErrorBoundary and functional hooks for error management.

## Overview

Our error handling system consists of:
1. **ErrorBoundary** (Class Component) - Catches JavaScript errors anywhere in the component tree
2. **useErrorHandler Hook** - Functional hook for programmatic error handling
3. **ErrorBoundaryWrapper** - Functional wrapper for easier ErrorBoundary usage
4. **Utility functions** - For async error handling and HOC patterns

## Why ErrorBoundary Must Stay as a Class Component

ErrorBoundary **cannot** be converted to a functional component because:
- React doesn't provide hook equivalents for `componentDidCatch` and `getDerivedStateFromError`
- Error boundaries must be class components to catch JavaScript errors in their component tree
- This is an official limitation/design decision by the React team

## Components

### 1. ErrorBoundary (Class Component)

Located: `src/components/common/ErrorBoundary.tsx`

Enhanced features:
- Custom error handlers via `onError` prop
- Auto-reset functionality with `resetKeys` prop
- Reset on prop changes with `resetOnPropsChange` prop
- Better error state management
- Development error details
- Unique error IDs for tracking

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling (logging, analytics, etc.)
    console.error('Custom error handler:', error, errorInfo);
  }}
  resetKeys={[userId, pageId]} // Auto-reset when these values change
  resetOnPropsChange={true}    // Reset when children prop changes
  fallback={<CustomFallbackComponent />}
>
  <YourComponent />
</ErrorBoundary>
```

### 2. ErrorBoundaryWrapper (Functional Component)

Located: `src/components/common/ErrorBoundaryWrapper.tsx`

A functional wrapper that makes ErrorBoundary easier to use:

```tsx
import { ErrorBoundaryWrapper } from '@/components/common/ErrorBoundaryWrapper';

function App() {
  return (
    <ErrorBoundaryWrapper
      onError={(error, errorInfo) => {
        // Handle error
      }}
      resetKeys={[someKey]}
    >
      <YourComponent />
    </ErrorBoundaryWrapper>
  );
}
```

### 3. useErrorHandler Hook

Located: `src/hooks/useErrorHandler.ts`

Provides functional components with error handling capabilities:

```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { throwError, captureError, error, hasError, clearError } = useErrorHandler();

  const handleAsyncOperation = async () => {
    try {
      await riskyAsyncOperation();
    } catch (error) {
      captureError(error as Error); // Captures but doesn't throw to ErrorBoundary
      // OR
      throwError(error as Error);   // Throws to ErrorBoundary
    }
  };

  if (hasError) {
    return (
      <div>
        Error occurred: {error?.message}
        <button onClick={clearError}>Try Again</button>
      </div>
    );
  }

  return <div>Normal component content</div>;
}
```

### 4. useErrorBoundary Hook

Located: `src/components/common/ErrorBoundaryWrapper.tsx`

Hook for functional components to interact with ErrorBoundary:

```tsx
import { useErrorBoundary } from '@/components/common/ErrorBoundaryWrapper';

function MyComponent() {
  const { captureError } = useErrorBoundary();

  const handleError = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      captureError(error as Error); // This will trigger the ErrorBoundary
    }
  };

  return <div>Component content</div>;
}
```

## Usage Patterns

### 1. Wrapping Your App

```tsx
// app/layout.tsx
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary
          onError={(error, errorInfo) => {
            // Send to error reporting service
            console.error('App-level error:', error, errorInfo);
          }}
        >
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 2. Component-Level Error Boundaries

```tsx
// For critical components
import { ErrorBoundaryWrapper } from '@/components/common/ErrorBoundaryWrapper';

function CriticalFeature() {
  return (
    <ErrorBoundaryWrapper
      fallback={<div>This feature is temporarily unavailable</div>}
    >
      <ComplexComponent />
    </ErrorBoundaryWrapper>
  );
}
```

### 3. Async Error Handling

```tsx
import { handleAsyncError } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { captureError } = useErrorBoundary();

  const fetchData = async () => {
    const [error, data] = await handleAsyncError(
      api.getData(),
      captureError  // Optional error handler
    );

    if (error) {
      console.error('Failed to fetch data:', error);
      return;
    }

    // Use data
    console.log(data);
  };

  return <div>Component content</div>;
}
```

### 4. HOC Pattern

```tsx
import { withErrorHandler } from '@/hooks/useErrorHandler';

const MyComponent = withErrorHandler(
  function MyComponent(props) {
    return <div>Component that might throw errors</div>;
  },
  function ErrorFallback({ error, resetError }) {
    return (
      <div>
        <h3>Component Error</h3>
        <p>{error.message}</p>
        <button onClick={resetError}>Retry</button>
      </div>
    );
  }
);
```

## Custom Error Fallbacks

Create custom error fallback components:

```tsx
function CustomErrorFallback({ error, resetError }) {
  return (
    <div className="error-container">
      <h2>Oops! Something went wrong</h2>
      <details>
        <summary>Error details</summary>
        <pre>{error.message}</pre>
      </details>
      <button onClick={resetError}>Try again</button>
      <button onClick={() => window.location.reload()}>Refresh page</button>
    </div>
  );
}

<ErrorBoundary fallback={<CustomErrorFallback />}>
  <App />
</ErrorBoundary>
```

## Best Practices

1. **Place ErrorBoundaries strategically**:
   - Root level for app-wide errors
   - Around major features/routes
   - Around third-party components

2. **Use custom error handlers**:
   - Log errors to monitoring services
   - Send error reports
   - Track error metrics

3. **Provide meaningful fallbacks**:
   - Show user-friendly error messages
   - Provide recovery options
   - Include retry mechanisms

4. **Handle async errors properly**:
   - Use try/catch for async operations
   - Use the provided utility functions
   - Don't let promises reject silently

5. **Reset strategies**:
   - Use `resetKeys` for automatic resets
   - Provide manual reset buttons
   - Consider navigation-based resets

## Error Reporting Integration

You can integrate with error reporting services:

```tsx
import * as Sentry from '@sentry/nextjs';

<ErrorBoundary
  onError={(error, errorInfo) => {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }}
>
  <App />
</ErrorBoundary>
```

## Testing Error Boundaries

```tsx
// Test component that throws errors
function ErrorThrower({ shouldThrow = false }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

// In your tests
test('ErrorBoundary catches errors', () => {
  render(
    <ErrorBoundary>
      <ErrorThrower shouldThrow={true} />
    </ErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

This system provides robust error handling while maintaining the necessary class component for ErrorBoundary functionality, complemented by modern functional patterns for easier usage.
