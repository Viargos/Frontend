import {
  LoginCredentials,
  SignUpCredentials,
  User,
  AuthResponse,
  ApiResponse,
} from "@/types/auth.types";
import {
  Journey,
  CreateJourneyDto,
  UpdateJourneyDto,
} from "@/types/journey.types";

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
        // Create an axios-like error structure for consistency
        const apiError = new Error(data.message || "API request failed") as any;
        apiError.response = {
          data: data,
          status: response.status,
          statusText: response.statusText
        };
        apiError.statusCode = data.statusCode;
        throw apiError;
      }

      return data;
    } catch (error) {
      // If it's already our custom error, throw it as is
      if (error && typeof error === 'object' && 'response' in error) {
        throw error;
      }
      
      // For network errors or other issues
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

  async resendOtp(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
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

  // Journey methods
  async getMyJourneys(): Promise<ApiResponse<Journey[]>> {
    return this.request<Journey[]>("/journeys/my-journeys");
  }

  async getAllJourneys(): Promise<ApiResponse<Journey[]>> {
    return this.request<Journey[]>("/journeys");
  }

  async getJourney(id: string): Promise<ApiResponse<Journey>> {
    return this.request<Journey>(`/journeys/${id}`);
  }

  async createJourney(data: CreateJourneyDto): Promise<ApiResponse<Journey>> {
    return this.request<Journey>("/journeys", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateJourney(
    id: string,
    data: UpdateJourneyDto
  ): Promise<ApiResponse<Journey>> {
    return this.request<Journey>(`/journeys/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteJourney(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/journeys/${id}`, {
      method: "DELETE",
    });
  }

  // User statistics methods
  async getUserStats(userId: string): Promise<
    ApiResponse<{
      posts: number;
      journeys: number;
      followers: number;
      following: number;
    }>
  > {
    try {
      const [postCount, journeyCount, followerCount, followingCount] =
        await Promise.all([
          this.request<{ count: number }>(`/posts/user/${userId}/count`),
          this.request<Journey[]>(`/journeys/my-journeys`),
          this.request<{ count: number }>(
            `/users/relationships/${userId}/followers/count`
          ),
          this.request<{ count: number }>(
            `/users/relationships/${userId}/following/count`
          ),
        ]);

      return {
        data: {
          posts: postCount.data?.count || 0,
          journeys: journeyCount.data?.length || 0,
          followers: followerCount.data?.count || 0,
          following: followingCount.data?.count || 0,
        },
        statusCode: 200,
        message: "User stats retrieved successfully",
      };
    } catch {
      return {
        data: { posts: 0, journeys: 0, followers: 0, following: 0 },
        statusCode: 500,
        message: "Failed to retrieve user stats",
      };
    }
  }

  async getCurrentUserStats(): Promise<
    ApiResponse<{
      posts: number;
      journeys: number;
      followers: number;
      following: number;
    }>
  > {
    try {
      const [postCount, journeyCount, followerCount, followingCount] =
        await Promise.all([
          this.request<{ count: number }>("/posts/user/me/count"),
          this.request<Journey[]>("/journeys/my-journeys"),
          this.request<{ count: number }>(
            "/users/relationships/followers/count"
          ),
          this.request<{ count: number }>(
            "/users/relationships/following/count"
          ),
        ]);

      return {
        data: {
          posts: postCount.data?.count || 0,
          journeys: journeyCount.data?.length || 0,
          followers: followerCount.data?.count || 0,
          following: followingCount.data?.count || 0,
        },
        statusCode: 200,
        message: "Current user stats retrieved successfully",
      };
    } catch {
      return {
        data: { posts: 0, journeys: 0, followers: 0, following: 0 },
        statusCode: 500,
        message: "Failed to retrieve current user stats",
      };
    }
  }

  // Image upload methods
  async uploadProfileImage(
    file: File
  ): Promise<ApiResponse<{ imageUrl: string; message: string }>> {
    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("token");
    const url = `${this.baseURL}/users/profile-image`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Create an axios-like error structure for consistency
        const apiError = new Error(data.message || "Upload failed") as any;
        apiError.response = {
          data: data,
          status: response.status,
          statusText: response.statusText
        };
        apiError.statusCode = data.statusCode;
        throw apiError;
      }

      return data;
    } catch (error) {
      // If it's already our custom error, throw it as is
      if (error && typeof error === 'object' && 'response' in error) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  }

  async uploadBannerImage(
    file: File
  ): Promise<ApiResponse<{ imageUrl: string; message: string }>> {
    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("token");
    const url = `${this.baseURL}/users/banner-image`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Create an axios-like error structure for consistency
        const apiError = new Error(data.message || "Upload failed") as any;
        apiError.response = {
          data: data,
          status: response.status,
          statusText: response.statusText
        };
        apiError.statusCode = data.statusCode;
        throw apiError;
      }

      return data;
    } catch (error) {
      // If it's already our custom error, throw it as is
      if (error && typeof error === 'object' && 'response' in error) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  }
}

const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;
