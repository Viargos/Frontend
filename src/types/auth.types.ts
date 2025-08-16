export interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  profileImage?: string;
  bannerImage?: string;
  location?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean | null; // null = not initialized, true = authenticated, false = not authenticated
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  username: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  accessToken?: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
}
