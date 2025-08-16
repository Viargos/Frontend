// Auth Modal Components
export { default as LoginModal } from './LoginModal';
export { default as SignupModal } from './SignupModal';
export { default as OtpModal } from './OtpModal';
export { default as AuthModals } from './AuthModals';
export { default as ModalContainer } from './ModalContainer';

// Auth Forms (existing)
export { default as LoginForm } from './LoginForm';
export { default as SignupForm } from './SignupForm';
export { default as OtpVerificationForm } from './OtpVerificationForm';

// Utilities
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as AuthInitializer } from './AuthInitializer';

// Legacy (will be removed)
export { default as AuthModal } from './AuthModal';

// Hooks
export { useAuthModals } from '@/hooks/useAuthModals';
export type { AuthModalType } from '@/hooks/useAuthModals';
