import { Post } from '@/types/post.types';
import { PaginationMetadata } from '../common/api-response.dto';

/**
 * Response DTO for GET /api/dashboard
 *
 * Backend contract: { data: Post[], pagination: {...} }
 *
 * This DTO is for type assertions in route handlers only.
 * API service methods should unwrap `response.data` and return Post[] with pagination.
 */
export interface DashboardPostsResponseDto {
  data: Post[];
  pagination: PaginationMetadata;
}
