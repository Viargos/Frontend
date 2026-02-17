import { PostDto } from './post.dto';
import { PaginationMetadata } from '../common/api-response.dto';

/**
 * Response DTO for GET /api/posts
 *
 * Backend contract: { data: PostDto[], pagination?: {...} }
 *
 * This DTO is for type assertions in route handlers only.
 * API service methods should unwrap `response.data` and return PostDto[] directly.
 */
export interface PostsListResponseDto {
  data: PostDto[];
  pagination?: PaginationMetadata;
}
