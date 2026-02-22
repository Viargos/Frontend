import { httpClient } from '../core/api-client';
import { API_ENDPOINTS } from '../config/endpoints';
import type {
  DashboardPostsResponseDto,
  DashboardFiltersDto,
} from '@/lib/dtos/dashboard';
import type { Post } from '@/types/post.types';
import type { PaginationMetadata } from '@/lib/dtos/common';
import { buildUrl } from '@/lib/utils/url.utils';

export class DashboardApiService {
  /**
   * Get paginated posts for dashboard feed
   * @param filters Optional filters (cursor, limit, location, search)
   * @returns Posts array and pagination metadata
   */
  async getPosts(filters?: DashboardFiltersDto): Promise<{
    posts: Post[];
    pagination: PaginationMetadata;
  }> {
    const url = buildUrl(API_ENDPOINTS.DASHBOARD.POSTS, filters);
    const response = await httpClient.get<DashboardPostsResponseDto>(url);
    return {
      posts: response.data,
      pagination: response.pagination,
    };
  }
}

export const DashboardApi = new DashboardApiService();
