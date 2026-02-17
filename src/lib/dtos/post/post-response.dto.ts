import { PostDto } from './post.dto';

/**
 * Response DTO for GET /api/posts/:id
 *
 * Backend contract: { data: PostDto }
 *
 * This DTO is for type assertions in route handlers only.
 * API service methods should unwrap `response.data` and return PostDto directly.
 */
export interface PostResponseDto {
  data: PostDto;
}

/**
 * Response DTO for PUT /api/posts/:id
 *
 * Backend contract: { data: PostDto }
 *
 * This DTO is for type assertions in route handlers only.
 * API service methods should unwrap `response.data` and return PostDto directly.
 */
export interface UpdatePostResponseDto {
  data: PostDto;
}
