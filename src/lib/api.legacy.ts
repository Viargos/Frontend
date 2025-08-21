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

    // Add auth token if available - using same key as TokenService
    const token = localStorage.getItem("viargos_auth_token");
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

        console.log("Token validation:", {
          isExpired,
          expiresAt: new Date(payload.exp * 1000).toISOString(),
          currentTime: new Date(currentTime * 1000).toISOString(),
          userId: payload.id,
          timeUntilExpiry: payload.exp - currentTime,
        });

        // Only remove token if it's significantly expired (more than 5 minutes)
        if (payload.exp < currentTime) {
          console.warn("Token is expired! Removing from localStorage.");
          localStorage.removeItem("viargos_auth_token");
          throw new Error(
            "Authentication token has expired. Please log in again."
          );
        } else if (isExpired) {
          console.warn("Token will expire soon, but continuing with request");
        }
      } catch (tokenError) {
        console.error("Token validation failed:", tokenError);
        // Only throw error if it's specifically about expiration
        if (tokenError.message && tokenError.message.includes("expired")) {
          throw tokenError;
        }
        // For other token parsing errors, continue with the request
        console.log("Token parsing failed, but continuing with request");
      }

      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
      console.log(
        "Added Authorization header with token for endpoint:",
        endpoint
      );
    } else {
      console.log(
        "No token found - Authorization header not added for endpoint:",
        endpoint
      );
      throw new Error("No authentication token found. Please log in.");
    }

    console.log("Final request headers:", config.headers);

    try {
      const response = await fetch(url, config);
      console.log(
        "Response status:",
        response.status,
        "for endpoint:",
        endpoint
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          data: data,
          endpoint: endpoint,
        });

        // Handle authentication errors specifically
        if (response.status === 401 || data.statusCode === 10001) {
          console.warn("Authentication failed, removing token");
          localStorage.removeItem("viargos_auth_token");

          // Create a more user-friendly error message
          const authError = new Error(
            "Your session has expired. Please log in again."
          ) as any;
          authError.response = {
            data: data,
            status: response.status,
            statusText: response.statusText,
          };
          authError.statusCode = data.statusCode;
          authError.isAuthError = true;
          throw authError;
        }

        // Create an axios-like error structure for consistency
        const apiError = new Error(data.message || "API request failed") as any;
        apiError.response = {
          data: data,
          status: response.status,
          statusText: response.statusText,
        };
        apiError.statusCode = data.statusCode;
        throw apiError;
      }

      console.log("API Success Response for", endpoint, ":", data);
      return data;
    } catch (error) {
      // If it's already our custom error, throw it as is
      if (error && typeof error === "object" && "response" in error) {
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

    const token = localStorage.getItem("viargos_auth_token");
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

    const token = localStorage.getItem("viargos_auth_token");
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

    const token = localStorage.getItem("viargos_auth_token");
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
        const apiError = new Error(data.message || "Upload failed") as any;
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

    const token = localStorage.getItem("viargos_auth_token");
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
        const apiError = new Error(data.message || "Upload failed") as any;
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

    const token = localStorage.getItem("viargos_auth_token");
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
        const apiError = new Error(data.message || "Upload failed") as any;
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
