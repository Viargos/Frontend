/**
 * Response DTO for POST /api/posts/:id/like and DELETE /api/posts/:id/like
 *
 * Backend contract:
 * - POST /api/posts/:id/like → Like a post
 * - DELETE /api/posts/:id/like → Unlike a post
 *
 * Response: { data: { isLiked: boolean, likeCount: number } }
 *
 * This DTO is for type assertions in route handlers only.
 * API service methods should unwrap `response.data` and return the like data directly.
 */
export interface LikeResponseDto {
  data: {
    isLiked: boolean;
    likeCount: number;
  };
}
