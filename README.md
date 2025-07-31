# Viargos Frontend

A modern travel and journey-sharing platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Authentication System**: Complete login/signup flow with OTP verification
- **State Management**: Zustand for global state management
- **Form Validation**: React Hook Form with Zod validation
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Protected Routes**: Authentication-based route protection
- **Modular Architecture**: Clean, maintainable code structure

## Authentication Flow

The application implements a complete authentication system with the following features:

1. **User Registration**: Sign up with email verification via OTP
2. **User Login**: Secure login with JWT tokens
3. **OTP Verification**: Email-based OTP verification for new accounts
4. **Protected Routes**: Automatic redirection for unauthenticated users
5. **Persistent Sessions**: Token-based session management
6. **Logout**: Secure logout with token cleanup

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── components/         # App-specific components
│   ├── dashboard/          # Dashboard page
│   ├── journeys/           # Journeys page
│   ├── profile/            # Profile page
│   └── page.tsx           # Home page
├── components/
│   ├── auth/              # Authentication components
│   │   ├── AuthModal.tsx
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── OtpVerificationForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── layout/            # Layout components
│   │   └── AuthenticatedLayout.tsx
│   ├── home/              # Home page components
│   ├── icons/             # Icon components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   └── api.ts            # API client
├── store/                 # State management
│   └── auth.store.ts     # Authentication store
└── types/                 # TypeScript type definitions
    ├── auth.types.ts     # Authentication types
    └── user.types.ts     # User-related types
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:3001`

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment file:

   ```bash
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication Components

### AuthModal

The main authentication modal that handles all auth flows:

- Login form
- Signup form
- OTP verification

### LoginForm

Handles user login with:

- Email and password validation
- Error handling
- Loading states

### SignupForm

Handles user registration with:

- Username, email, phone, password validation
- Password confirmation
- Form validation with Zod

### OtpVerificationForm

Handles OTP verification with:

- 6-digit OTP input
- Auto-submission
- Resend functionality
- Countdown timer

### ProtectedRoute

Wrapper component for protected pages:

- Authentication checks
- Automatic redirects
- Loading states

## State Management

The application uses Zustand for state management with the following stores:

### AuthStore

Manages authentication state:

- User information
- Authentication status
- Loading states
- Error handling
- Token management

## API Integration

The application includes a comprehensive API client (`lib/api.ts`) with:

- Axios-based HTTP client
- Request/response interceptors
- Automatic token management
- Error handling
- All backend endpoints

## Styling

The application uses Tailwind CSS for styling with:

- Custom color palette
- Responsive design
- Component-based styling
- Dark mode support (ready)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks (recommended)

## Backend Integration

The frontend is designed to work with the Viargos backend API. Make sure your backend is running and accessible at the configured URL.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
