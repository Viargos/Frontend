import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AuthState,
  User,
  LoginCredentials,
  SignUpCredentials,
} from '@/types/auth.types';
import { serviceFactory } from '@/lib/services/service-factory';
import { ApiError } from '@/lib/interfaces/http-client.interface';

export interface AuthResult {
  success: boolean;
  error?: string | any;
}

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  signup: (credentials: SignUpCredentials) => Promise<AuthResult>;
  verifyOtp: (email: string, otp: string) => Promise<AuthResult>;
  resendOtp: (email: string) => Promise<AuthResult>;
  logout: () => void;
  getProfile: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  
  // Initialize auth state on app start
  initialize: () => Promise<void>;
}

export const useAuthStoreV2 = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials): Promise<AuthResult> => {
        try {
          set({ isLoading: true, error: null });

          const response = await serviceFactory.authService.login(credentials);
          const { accessToken } = response.data || {};

          if (accessToken) {
            serviceFactory.tokenService.setToken(accessToken);
            set({ token: accessToken, isAuthenticated: true });

            // Get user profile
            await get().getProfile();
            return { success: true };
          }

          return { success: false, error: 'No access token received' };
        } catch (error) {
          const authStore = get();
          const errorMessage = authStore.extractErrorMessage(error);
          set({ error: errorMessage, isAuthenticated: false });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (credentials: SignUpCredentials): Promise<AuthResult> => {
        try {
          console.log('🎨 Auth Store: Starting signup process');
          set({ isLoading: true, error: null });

          console.log('📞 Auth Store: Calling authService.signup');
          await serviceFactory.authService.signup(credentials);
          
          console.log('✅ Auth Store: Signup API call successful');
          set({ error: null });
          const result = { success: true };
          console.log('📊 Auth Store: Returning success result:', result);
          return result;
        } catch (error: any) {
          console.log('❌ Auth Store: Signup error caught:', error);
          
          let errorMessage = 'An unexpected error occurred';
          let fullError = error;
          
          // Handle ApiError with field-specific validation
          if (error instanceof ApiError) {
            errorMessage = error.message;
            // If the error has field-specific details, pass the full error object
            if (error.details && typeof error.details === 'object' && error.details.errors) {
              fullError = error.details;
            }
          } else if (error?.response?.data) {
            // Handle axios-style errors
            const responseData = error.response.data;
            errorMessage = responseData.message || 'Signup failed';
            // If we have field-specific errors, return them
            if (responseData.errors && typeof responseData.errors === 'object') {
              fullError = responseData;
            }
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          set({ error: errorMessage });
          return { success: false, error: fullError };
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOtp: async (email: string, otp: string): Promise<AuthResult> => {
        try {
          set({ isLoading: true, error: null });

          const response = await serviceFactory.authService.verifyOtp(email, otp);
          const { accessToken } = response.data || {};

          if (accessToken) {
            serviceFactory.tokenService.setToken(accessToken);
            set({ token: accessToken, isAuthenticated: true });

            // Get user profile
            await get().getProfile();
            return { success: true };
          }

          return { success: false, error: 'No access token received' };
        } catch (error) {
          const authStore = get();
          const errorMessage = authStore.extractErrorMessage(error);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      resendOtp: async (email: string): Promise<AuthResult> => {
        try {
          set({ isLoading: true, error: null });

          await serviceFactory.authService.resendOtp(email);
          set({ error: null });
          return { success: true };
        } catch (error) {
          const authStore = get();
          const errorMessage = authStore.extractErrorMessage(error);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        serviceFactory.tokenService.removeToken();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      getProfile: async (): Promise<void> => {
        try {
          const response = await serviceFactory.authService.getProfile();
          const user: User | undefined = response.data;

          if (!user) {
            throw new Error('No user data received');
          }

          set({ user, isAuthenticated: true });
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
          }
        } catch (error) {
          console.error('Failed to get profile:', error);
          // If we can't get the profile, the token might be invalid
          get().logout();
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initialize: async (): Promise<void> => {
        const token = serviceFactory.tokenService.getToken();
        
        if (!token || serviceFactory.tokenService.isTokenExpired(token)) {
          get().logout();
          return;
        }

        set({ token, isAuthenticated: true });
        
        try {
          await get().getProfile();
        } catch (error) {
          console.error('Failed to initialize auth state:', error);
          get().logout();
        }
      },

      // Helper method to extract error messages consistently
      extractErrorMessage: (error: unknown): string => {
        if (error instanceof ApiError) {
          return error.message;
        }
        
        if (error instanceof Error) {
          return error.message;
        }
        
        if (typeof error === 'string') {
          return error;
        }
        
        return 'An unexpected error occurred';
      },
    }),
    {
      name: 'viargos-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
