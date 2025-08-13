import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AuthState,
  User,
  LoginCredentials,
  SignUpCredentials,
} from "@/types/auth.types";
import apiClient from "../lib/api";

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signup: (credentials: SignUpCredentials) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getProfile: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });

          // Validate credentials
          if (!credentials.email || !credentials.password) {
            const errorMessage = "Email and password are required";
            set({ error: errorMessage, isAuthenticated: false });
            return { success: false, error: errorMessage };
          }

          const response = await apiClient.signIn(credentials);
          const { accessToken } = response.data || {};

          if (accessToken) {
            localStorage.setItem("token", accessToken);
            set({ token: accessToken, isAuthenticated: true });

            // Get user profile
            await get().getProfile();
            return { success: true };
          }
          return { success: false, error: "No access token received" };
        } catch (error: unknown) {
          let errorMessage = "Login failed";
          
          // Handle axios-style errors
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            errorMessage = axiosError.response?.data?.message || "Login failed";
          }
          // Handle direct Error objects
          else if (error instanceof Error) {
            errorMessage = error.message || "Login failed";
          }
          // Handle any other error formats
          else if (typeof error === 'string') {
            errorMessage = error;
          }
          
          console.error('Login error:', error);
          set({ error: errorMessage, isAuthenticated: false });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (credentials: SignUpCredentials) => {
        try {
          set({ isLoading: true, error: null });
          
          // Validate credentials
          if (!credentials.username || !credentials.email || !credentials.password) {
            const errorMessage = "Username, email, and password are required";
            set({ error: errorMessage });
            return { success: false, error: errorMessage };
          }

          if (credentials.username.length < 3) {
            const errorMessage = "Username must be at least 3 characters";
            set({ error: errorMessage });
            return { success: false, error: errorMessage };
          }

          if (credentials.password.length < 6) {
            const errorMessage = "Password must be at least 6 characters";
            set({ error: errorMessage });
            return { success: false, error: errorMessage };
          }

          console.log("Inside the signup function");
          const response = await apiClient.signUp(credentials);
          console.log("signup API response:", response);
          console.log("signup successful - check backend console for OTP");
          set({ error: null });
          return { success: true };
        } catch (error: unknown) {
          console.log("Signup caught error:", error);
          let errorMessage = "Signup failed";
          
          // Handle axios-style errors
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            errorMessage = axiosError.response?.data?.message || "Signup failed";
            console.log("Axios-style error, message:", errorMessage);
          }
          // Handle direct Error objects
          else if (error instanceof Error) {
            errorMessage = error.message || "Signup failed";
            console.log("Direct Error object, message:", errorMessage);
          }
          // Handle any other error formats
          else if (typeof error === 'string') {
            errorMessage = error;
            console.log("String error:", errorMessage);
          }
          
          console.error('Signup error:', error);
          console.log('Setting error in store:', errorMessage);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOtp: async (email: string, otp: string) => {
        try {
          set({ isLoading: true, error: null });

          // Validate inputs
          if (!email || !otp) {
            const errorMessage = "Email and OTP are required";
            set({ error: errorMessage });
            return { success: false, error: errorMessage };
          }

          if (otp.length !== 6) {
            const errorMessage = "OTP must be 6 digits";
            set({ error: errorMessage });
            return { success: false, error: errorMessage };
          }

          const response = await apiClient.verifyOtp({ email, otp });
          const { accessToken } = response.data || {};

          if (accessToken) {
            localStorage.setItem("token", accessToken);
            set({ token: accessToken, isAuthenticated: true });

            // Get user profile
            await get().getProfile();
            return { success: true };
          }
          return { success: false, error: "No access token received" };
        } catch (error: unknown) {
          let errorMessage = "OTP verification failed";
          
          // Handle axios-style errors
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            errorMessage = axiosError.response?.data?.message || "OTP verification failed";
          }
          // Handle direct Error objects
          else if (error instanceof Error) {
            errorMessage = error.message || "OTP verification failed";
          }
          // Handle any other error formats
          else if (typeof error === 'string') {
            errorMessage = error;
          }
          
          console.error('OTP verification error:', error);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      resendOtp: async (email: string) => {
        try {
          set({ isLoading: true, error: null });

          // Validate email
          if (!email) {
            const errorMessage = "Email is required";
            set({ error: errorMessage });
            return { success: false, error: errorMessage };
          }

          // Call the API to resend OTP
          await apiClient.resendOtp(email);
          set({ error: null });
          return { success: true };
        } catch (error: unknown) {
          let errorMessage = "Failed to resend OTP";
          
          // Handle axios-style errors
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            errorMessage = axiosError.response?.data?.message || "Failed to resend OTP";
          }
          // Handle direct Error objects
          else if (error instanceof Error) {
            errorMessage = error.message || "Failed to resend OTP";
          }
          // Handle any other error formats
          else if (typeof error === 'string') {
            errorMessage = error;
          }
          
          console.error('Resend OTP error:', error);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      getProfile: async () => {
        try {
          const response = await apiClient.getProfile();
          const user: User | undefined = response.data;

          if (!user) {
            throw new Error("No user data received");
          }

          set({ user, isAuthenticated: true });
          localStorage.setItem("user", JSON.stringify(user));
        } catch (error: unknown) {
          console.error("Failed to get profile:", error);
          // If we can't get the profile, the token might be invalid
          // Logout the user to clear invalid state
          get().logout();
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
