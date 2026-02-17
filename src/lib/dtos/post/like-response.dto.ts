/**
 * Response DTO for POST /api/posts/:id/like and DELETE /api/posts/:id/unlike
 *
 * Backend contract: { data: { isLiked: boolean, likesCount: number } }
 *
 * This DTO is for type assertions in route handlers only.
 * API service methods should unwrap `response.data` and return the like data directly.
 */
export interface LikeResponseDto {
  data: {
    isLiked: boolean;
    likesCount: number;
  };
}
