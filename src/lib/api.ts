import {
  LoginCredentials,
  SignUpCredentials,
  User,
  AuthResponse,
  ApiResponse,
} from "@/types/auth.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  }

  // Auth endpoints
  async signIn(
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async signUp(
    credentials: SignUpCredentials
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async verifyOtp(data: {
    email: string;
    otp: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/profile");
  }

  async forgotPassword(
    email: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(data: {
    token: string;
    password: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;
