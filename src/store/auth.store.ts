import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AuthState,
  User,
  LoginCredentials,
  SignUpCredentials,
} from "@/types/auth.types";
import { serviceFactory } from "@/lib/services/service-factory";
import { ApiError } from "@/lib/interfaces/http-client.interface";

export type AuthModalType = "login" | "signup" | "otp" | "none";

export interface AuthResult {
  success: boolean;
  error?: string | unknown;
}

interface AuthStore extends AuthState {
  // Modal state
  activeModal: AuthModalType;
  signupEmail: string;

  // Auth actions
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  signup: (credentials: SignUpCredentials) => Promise<AuthResult>;
  verifyOtp: (email: string, otp: string) => Promise<AuthResult>;
  resendOtp: (email: string) => Promise<AuthResult>;
  logout: () => void;
  getProfile: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;

  // Modal actions
  openLogin: () => void;
  openSignup: () => void;
  openOtp: (email: string) => void;
  closeAllModals: () => void;
  switchToLogin: () => void;
  switchToSignup: () => void;
  switchToOtp: (email: string) => void;

  // Initialize auth state on app start
  initialize: () => Promise<void>;

  // Helper methods
  extractErrorMessage: (error: unknown) => string;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state - null indicates auth state hasn't been checked yet
      user: null,
      token: null,
      isAuthenticated: null,
      isLoading: false,
      error: null,

      // Modal state
      activeModal: "none",
      signupEmail: "",

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

          return { success: false, error: "No access token received" };
        } catch (error) {
          const errorMessage = get().extractErrorMessage(error);
          set({ error: errorMessage, isAuthenticated: false });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (credentials: SignUpCredentials): Promise<AuthResult> => {
        try {
          set({ isLoading: true, error: null });

          await serviceFactory.authService.signup(credentials);

          set({ error: null });
          return { success: true };
        } catch (error: unknown) {
          let errorMessage = "An unexpected error occurred";
          let fullError = error;

          // Handle ApiError with field-specific validation
          if (error instanceof ApiError) {
            errorMessage = error.message;
            // If the error has field-specific details, pass the full error object
            if (
              (error as any).details &&
              typeof (error as any).details === "object" &&
              (error as any).details.errors
            ) {
              fullError = (error as any).details;
            }
          } else if ((error as any)?.response?.data) {
            // Handle axios-style errors
            const responseData = (error as any).response.data;
            errorMessage = responseData.message || "Signup failed";
            // If we have field-specific errors, return them
            if (
              responseData.errors &&
              typeof responseData.errors === "object"
            ) {
              fullError = responseData;
            }
          } else if ((error as any)?.message) {
            errorMessage = (error as any).message;
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

          const response = await serviceFactory.authService.verifyOtp(
            email,
            otp
          );
          const { accessToken } = response.data || {};

          if (accessToken) {
            serviceFactory.tokenService.setToken(accessToken);
            set({ token: accessToken, isAuthenticated: true });

            // Get user profile
            await get().getProfile();
            return { success: true };
          }
          return { success: false, error: "No access token received" };
        } catch (error) {
          const errorMessage = get().extractErrorMessage(error);
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
          const errorMessage = get().extractErrorMessage(error);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        serviceFactory.tokenService.removeToken();
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
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
            throw new Error("No user data received");
          }

          set({ user, isAuthenticated: true });
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(user));
          }
        } catch (error) {
          console.error("Failed to get profile:", error);
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
          console.error("Failed to initialize auth state:", error);
          get().logout();
        }
      },

      // Modal actions
      openLogin: () => {
        set({ activeModal: "login", signupEmail: "", error: null });
      },

      openSignup: () => {
        set({ activeModal: "signup", signupEmail: "", error: null });
      },

      openOtp: (email: string) => {
        set({ activeModal: "otp", signupEmail: email, error: null });
      },

      closeAllModals: () => {
        set({ activeModal: "none", signupEmail: "", error: null });
        
        // Aggressive scroll restoration
        setTimeout(() => {
          if (typeof window !== "undefined") {
            const body = document.body;
            const html = document.documentElement;
            
            // Reset all scroll-related styles aggressively
            body.style.overflow = "";
            body.style.position = "";
            body.style.top = "";
            body.style.width = "";
            body.style.height = "";
            html.style.overflow = "";
            html.style.position = "";
            html.style.top = "";
            html.style.width = "";
            html.style.height = "";
            
            // Force reflow
            body.offsetHeight;
            
            // Remove any potential CSS classes that might lock scroll
            body.classList.remove('modal-open', 'scroll-locked', 'overflow-hidden');
            html.classList.remove('modal-open', 'scroll-locked', 'overflow-hidden');
            
            // Force another reflow
            document.documentElement.scrollTop = document.documentElement.scrollTop;
          }
        }, 10);
      },

      switchToLogin: () => {
        set({ activeModal: "login", error: null });
      },

      switchToSignup: () => {
        set({ activeModal: "signup", error: null });
      },

      switchToOtp: (email: string) => {
        set({ activeModal: "otp", signupEmail: email, error: null });
      },

      // Helper method to extract error messages consistently
      extractErrorMessage: (error: unknown): string => {
        if (error instanceof ApiError) {
          return error.message;
        }

        if (error instanceof Error) {
          return error.message;
        }

        if (typeof error === "string") {
          return error;
        }

        return "An unexpected error occurred";
      },
    }),
    {
      name: "viargos-auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
