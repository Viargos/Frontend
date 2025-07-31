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
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignUpCredentials) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
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

          const response = await apiClient.signIn(credentials);
          const { accessToken } = response.data || {};

          if (accessToken) {
            localStorage.setItem("token", accessToken);
            set({ token: accessToken, isAuthenticated: true });

            // Get user profile
            await get().getProfile();
          }
        } catch (error: unknown) {
          const errorMessage =
            (error as any)?.response?.data?.message || "Login failed";
          set({ error: errorMessage, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (credentials: SignUpCredentials) => {
        try {
          set({ isLoading: true, error: null });
          console.log("Inside the signup function");
          await apiClient.signUp(credentials);
          console.log("signup successful - check backend console for OTP");
          set({ error: null });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Signup failed";
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOtp: async (email: string, otp: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await apiClient.verifyOtp({ email, otp });
          const { accessToken } = response.data || {};

          if (accessToken) {
            localStorage.setItem("token", accessToken);
            set({ token: accessToken, isAuthenticated: true });

            // Get user profile
            await get().getProfile();
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "OTP verification failed";
          set({ error: errorMessage });
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
          const user: User = response.data;

          set({ user, isAuthenticated: true });
          localStorage.setItem("user", JSON.stringify(user));
        } catch (error: any) {
          console.error("Failed to get profile:", error);
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
