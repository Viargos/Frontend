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
import {
  NearbyJourneysParams,
  NearbyJourneysResponse,
} from "@/types/user.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

import { serviceFactory } from "@/lib/services/service-factory";

// Local typed error used to attach response/status metadata without using `any`
type ApiClientError = Error & {
  response?: { data?: unknown; status?: number; statusText?: string };
  statusCode?: number | string;
  isAuthError?: boolean;
};

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

    // Debug logging - Remove these after confirming fix works
    // console.log('API Request Debug:', {
    //   endpoint,
    //   url,
    //   method: options.method || 'GET',
    //   windowExists: typeof window !== 'undefined',
    //   localStorageExists: typeof localStorage !== 'undefined'
    // });

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available - use centralized TokenService (handles window checks)
    const token = serviceFactory.tokenService.getToken();
    console.log("Token retrieval debug:", {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 10) + "..." : "NO TOKEN",
      endpoint: endpoint,
    });

    if (token) {
      // Check if token is expired (with some buffer time)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        // Add 5 minutes buffer to account for server/client time differences
        const bufferTime = 5 * 60;
        const isExpired = payload.exp < currentTime + bufferTime;

        // Token validation (removed console logs)

        // Only remove token if it's significantly expired (more than 5 minutes)
        if (payload.exp < currentTime) {
          console.warn("Token is expired! Removing token via TokenService.");
          serviceFactory.tokenService.removeToken();
          throw new Error(
            "Authentication token has expired. Please log in again."
          );
        }
      } catch (tokenError) {
        // Only throw error if it's specifically about expiration
        if (
          tokenError instanceof Error &&
          tokenError.message.includes("expired")
        ) {
          throw tokenError;
        }
        // For other token parsing errors, continue with the request
      }

      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    } else {
      throw new Error("No authentication token found. Please log in.");
    }

    // Request headers configured

    try {
      const response = await fetch(url, config);

      // Handle empty responses (204 No Content or empty 200) gracefully
      // This prevents JSON parsing errors that could trigger session invalidation
      let data: any;
      const contentType = response.headers.get('content-type');
      const hasContent = response.status !== 204 && response.status !== 205;
      
      if (hasContent && contentType && contentType.includes('application/json')) {
        try {
          const text = await response.text();
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          // If JSON parsing fails, don't treat it as an auth error
          // This is critical for DELETE requests that might return empty responses
          if (!response.ok) {
            // Only throw if response is not OK
            throw new Error(`Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
          }
          // For successful responses with parse errors, return empty object
          data = {};
        }
      } else {
        // For 204 No Content or responses without JSON content-type
        data = response.ok ? { success: true } : {};
      }

      if (!response.ok) {
        // Handle authentication errors specifically
        // Only remove token if it's a genuine 401 Unauthorized error
        if (response.status === 401) {
          // Check if the error data indicates an auth issue
          const isAuthError = data?.statusCode === 10001 || 
                             data?.message?.toLowerCase().includes('unauthorized') ||
                             data?.message?.toLowerCase().includes('token');
          
          if (isAuthError) {
            console.warn(
              "Authentication failed, removing token via TokenService"
            );
            serviceFactory.tokenService.removeToken();

            // Create a more user-friendly error message
            const authError = new Error(
              "Your session has expired. Please log in again."
            ) as ApiClientError;
            authError.response = {
              data: data,
              status: response.status,
              statusText: response.statusText,
            };
            authError.statusCode = data?.statusCode;
            authError.isAuthError = true;
            throw authError;
          }
        }

        // Create an axios-like error structure for consistency
        const apiError = new Error(
          data?.message || "API request failed"
        ) as ApiClientError;
        apiError.response = {
          data: data,
          status: response.status,
          statusText: response.statusText,
        };
        apiError.statusCode = data?.statusCode;
        throw apiError;
      }

      return data;
    } catch (error) {
      // If it's already our custom error, throw it as is
      if (error && typeof error === "object" && "response" in error) {
        throw error;
      }

      // For network errors or other issues - don't invalidate session
      // Only network/parsing errors should reach here, not auth errors
      if (error instanceof Error) {
        // Don't treat parsing errors as auth errors
        if (error.message.includes('parse') || error.message.includes('JSON')) {
          throw new Error(`Request failed: ${error.message}`);
        }
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

  // Journey methods (removed getMyJourneys)

  async getAllJourneys(): Promise<ApiResponse<Journey[]>> {
    return this.request<Journey[]>("/journeys");
  }

  async getMyJourneys(): Promise<ApiResponse<Journey[]>> {
    return this.request<Journey[]>("/journeys/my-journeys");
  }

  async getJourney(id: string): Promise<ApiResponse<Journey>> {
    return this.request<Journey>(`/journeys/${id}`);
  }

  async createJourney(data: CreateJourneyDto): Promise<ApiResponse<Journey>> {
    console.log("Creating journey:", data);
    return this.request<Journey>("/journeys", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Create journey with full days + places structure (used by JourneyCreationForm)
  // Backend uses the same /journeys endpoint with CreateJourneyDto (which already includes days),
  // so this is just a typed alias that sends the full payload.
  async createComprehensiveJourney(
    data: CreateJourneyDto
  ): Promise<ApiResponse<Journey>> {
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

  async getNearbyJourneys(params: NearbyJourneysParams): Promise<NearbyJourneysResponse> {
    const { latitude, longitude, radius, limit = 20 } = params;
    const queryParams = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
      limit: limit.toString(),
    });
    
    return this.request<any[]>(`/journeys/nearby?${queryParams.toString()}`);
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
          // Removed journeys count API call
          Promise.resolve({
            data: [],
            statusCode: 200,
            message: "Journeys not loaded",
          }),
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
          // Removed journeys count API call
          Promise.resolve({
            data: [],
            statusCode: 200,
            message: "Journeys not loaded",
          }),
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
    const token = serviceFactory.tokenService.getToken();
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
        const apiError = new Error(
          data.message || "Upload failed"
        ) as ApiClientError;
        apiError.response = {
          data: data,
          status: response.status,
          statusText: response.statusText,
        };
        apiError.statusCode = data.statusCode;
        throw apiError;
      }

      return data;
    } catch (error) {
      // If it's already our custom error, throw it as is
      if (error && typeof error === "object" && "response" in error) {
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
    const token = serviceFactory.tokenService.getToken();
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
        const apiError = new Error(
          data.message || "Upload failed"
        ) as ApiClientError;
        apiError.response = {
          data: data,
          status: response.status,
          statusText: response.statusText,
        };
        apiError.statusCode = data.statusCode;
        throw apiError;
      }

      return data;
    } catch (error) {
      // If it's already our custom error, throw it as is
      if (error && typeof error === "object" && "response" in error) {
        throw error;
      }

      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  }

  // Journey image upload methods
  async uploadJourneyImage(
    journeyId: string,
    file: File
  ): Promise<ApiResponse<{ imageUrl: string; message: string }>> {
    const formData = new FormData();
    formData.append("image", file);
    const token = serviceFactory.tokenService.getToken();
    const url = `${this.baseURL}/journeys/${journeyId}/image`;

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
        const apiError = new Error(
          data.message || "Upload failed"
        ) as ApiClientError;
        apiError.response = {
          data: data,
          status: response.status,
          statusText: response.statusText,
        };
        apiError.statusCode = data.statusCode;
        throw apiError;
      }

      return data;
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        throw error;
      }

      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  }

  async uploadJourneyCoverImage(
    journeyId: string,
    file: File
  ): Promise<ApiResponse<{ imageUrl: string; message: string }>> {
    const formData = new FormData();
    formData.append("image", file);
    const token = serviceFactory.tokenService.getToken();
    const url = `${this.baseURL}/journeys/${journeyId}/cover-image`;

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
        const apiError = new Error(
          data.message || "Upload failed"
        ) as ApiClientError;
        apiError.response = {
          data: data,
          status: response.status,
          statusText: response.statusText,
        };
        apiError.statusCode = data.statusCode;
        throw apiError;
      }

      return data;
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        throw error;
      }

      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  }

  async uploadUserProfileImage(
    userId: string,
    file: File
  ): Promise<ApiResponse<{ imageUrl: string; message: string }>> {
    const formData = new FormData();
    formData.append("image", file);
    const token = serviceFactory.tokenService.getToken();
    const url = `${this.baseURL}/users/${userId}/profileimage`;

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
        const apiError = new Error(
          data.message || "Upload failed"
        ) as ApiClientError;
        apiError.response = {
          data: data,
          status: response.status,
          statusText: response.statusText,
        };
        apiError.statusCode = data.statusCode;
        throw apiError;
      }

      return data;
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
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
