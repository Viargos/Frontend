import { IHttpClient, RequestConfig, ApiResponse, ApiError } from '../interfaces/http-client.interface';
import { ITokenService } from './token.service';

export class HttpClientService implements IHttpClient {
  constructor(
    private baseURL: string,
    private tokenService: ITokenService
  ) {}

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = this.tokenService.getToken();
    if (token && !this.tokenService.isTokenExpired(token)) {
      requestConfig.headers = {
        ...requestConfig.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, requestConfig);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || 'API request failed',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new ApiError(error.message, 0);
      }
      
      throw new ApiError('Network error', 0);
    }
  }

  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'GET' }, config);
  }

  async post<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      url,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    );
  }

  async put<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      url,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    );
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      url,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    );
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' }, config);
  }

  async uploadFile<T>(
    url: string,
    file: File,
    fieldName: string = 'file',
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const token = this.tokenService.getToken();
    const requestConfig: RequestInit = {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config?.headers,
      },
      body: formData,
    };

    try {
      const response = await fetch(`${this.baseURL}${url}`, requestConfig);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || 'Upload failed',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new ApiError(error.message, 0);
      }
      
      throw new ApiError('Network error', 0);
    }
  }
}
