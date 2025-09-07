# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Viargos Frontend** is a modern travel and journey-sharing platform built with Next.js 15, React 19, TypeScript, and Tailwind CSS 4. It features a comprehensive authentication system, media upload capabilities, and a responsive dashboard interface for travel content management.

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Common Development Tasks
```bash
# Type checking
npx tsc --noEmit

# Build and test production bundle locally
npm run build && npm run start

# Reset Next.js cache if encountering build issues
rm -rf .next

# Check for outdated dependencies
npm outdated
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript 5
- **Styling**: Tailwind CSS 4 with PostCSS
- **State Management**: Zustand with persistence
- **Forms**: React Hook Form with Zod validation
- **File Upload**: AWS S3 integration via @aws-sdk/client-s3
- **Maps**: Google Maps API integration
- **HTTP Client**: Axios with interceptors
- **Animations**: Framer Motion

### Project Structure
```
src/
├── app/                     # Next.js App Router
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── create-journey/ # Journey creation
│   │   ├── dashboard/      # Main dashboard
│   │   ├── explore/        # Journey exploration
│   │   ├── journeys/       # Journey management
│   │   └── profile/        # User profile
│   ├── components/         # App-specific components
│   └── layout.tsx          # Root layout with auth
├── components/
│   ├── auth/              # Authentication components
│   ├── common/            # Shared UI components (ErrorBoundary, Loading)
│   ├── home/              # Landing page components
│   ├── icons/             # Custom icon components
│   └── [feature]/         # Feature-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and services
│   ├── api.ts            # Modern API client
│   ├── api.legacy.ts     # Legacy API compatibility
│   └── services/         # Service architecture
├── store/                 # Zustand state management
├── types/                 # TypeScript type definitions
└── aws/                   # AWS S3 integration
```

### State Management Architecture

The application uses **Zustand** with a service-oriented architecture:

1. **AuthStore** (`src/store/auth.store.ts`): Manages authentication state, user sessions, and modal states
2. **Service Factory** (`src/lib/services/service-factory.ts`): Creates service instances with dependency injection
3. **HTTP Client**: Axios-based client with automatic token management and interceptors

Key services:
- `authService`: Authentication operations
- `userService`: User management
- `tokenService`: JWT token handling
- `validationService`: Form validation utilities

### Authentication Flow

1. **Initial Load**: `AuthInitializer` checks stored tokens and validates sessions
2. **Modal System**: Centralized auth modals (login, signup, OTP) managed by Zustand store
3. **Protected Routes**: `(dashboard)` layout automatically redirects unauthenticated users
4. **Token Management**: Automatic token refresh and cleanup on logout

### Component Patterns

#### Error Handling
- **ErrorBoundary** (class component): Catches JavaScript errors in component tree
- **useErrorHandler hook**: Functional error handling with local state management
- **ErrorBoundaryWrapper**: Functional wrapper for easier ErrorBoundary usage

#### Form Validation
- React Hook Form + Zod for type-safe form validation
- Custom validation service for reusable validation logic
- Error state management integrated with auth store

#### Media Upload
- S3 direct upload with progress tracking
- `useMediaUpload` hook for file handling
- Support for images and videos with size/type validation

## File Upload System

The application implements direct S3 uploads:

1. **Frontend**: File selection via drag-and-drop or file picker
2. **Processing**: Client-side validation (size, type, format)
3. **Upload**: Direct S3 upload with progress tracking
4. **Backend**: S3 keys stored with journey/profile data

Key files:
- `src/lib/aws/media-upload.ts`: S3 upload service
- `src/hooks/useMediaUpload.ts`: Upload hook with progress tracking
- `src/components/media/PhotoUploadModal.tsx`: Upload UI component

## Environment Setup

### Required Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
NEXT_PUBLIC_AWS_REGION=your-aws-region
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret-key
NEXT_PUBLIC_S3_BUCKET_NAME=your-bucket-name
```

### Backend Integration
The frontend expects a REST API running on `http://localhost:3001` with these key endpoints:
- `POST /auth/login` - User authentication
- `POST /auth/signup` - User registration  
- `POST /auth/verify-otp` - OTP verification
- `GET /auth/profile` - Get user profile
- `POST /journeys` - Create journey
- `POST /users/{id}/profileimage` - Profile image upload

## Custom Hooks System

The application includes a comprehensive custom hooks library documented in `CUSTOM_HOOKS.md`:

- `useClickOutside`: Handle clicks outside elements
- `useBodyScrollLock`: Lock body scroll for modals
- `useKeyboardShortcut`: Keyboard event handling
- `useDebounce`: Debounce values and callbacks
- `useFileUpload`: File upload with drag-and-drop
- `useApi`: API calls with loading/error states
- `useWindowSize`: Responsive design helpers
- `useErrorHandler`: Error handling integration
- `useAuthModals`: Authentication modal management

## Responsive Design

The application uses a mobile-first approach with Tailwind CSS breakpoints:
- **xs** (< 640px): Mobile phones
- **sm** (640px+): Large phones/small tablets  
- **md** (768px+): Tablets
- **lg** (1024px+): Small laptops
- **xl** (1280px+): Desktops

Layout patterns:
- Mobile: Single column, collapsible sidebars
- Tablet: Two-column grid, drawer navigation
- Desktop: Three-column layout with sticky sidebars

## Development Guidelines

### Code Organization
- Follow SOLID principles for component design
- Use TypeScript for all new code
- Implement proper error boundaries around major features
- Leverage custom hooks for reusable logic

### API Integration
- Use the modern service architecture for new features
- Maintain backward compatibility with legacy API client
- Handle loading states and errors consistently
- Implement proper retry logic for network requests

### Styling
- Use Tailwind CSS utility classes
- Follow the design system variables in `globals.css`
- Implement responsive design for all new components
- Use custom CSS variables for consistent theming

### Testing Considerations
- The project structure supports unit testing with @testing-library/react
- Error boundaries can be tested with error-throwing components
- Custom hooks should be tested with renderHook utility
- API services should be mocked for component testing

This architecture provides a solid foundation for building and maintaining a modern React application with proper separation of concerns, comprehensive error handling, and excellent developer experience.
