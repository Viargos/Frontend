import { httpClient } from '../core/api-client';
import { API_ENDPOINTS } from '../config/endpoints';
import { HttpMethod } from '@/enums';
import { buildUrl } from '@/lib/utils/url.utils';
import type {
  CreatePostRequestDto,
  PostDto,
  PostResponseDto,
  UpdatePostResponseDto,
  PostsListResponseDto,
  LikeResponseDto,
  PostCommentDto,
  CreateCommentRequestDto,
  AddMediaRequestDto,
  PostMediaDto,
} from '@/lib/dtos/post';
import type { ApiResponse } from '@/lib/dtos/common';

export class PostApiService {
  /**
   * Create new post
   * @param payload Post creation data (content, type, journeyId, etc.)
   * @returns Created post
   */
  async create(payload: CreatePostRequestDto): Promise<PostDto> {
    const response = await httpClient.post<PostResponseDto>(
      API_ENDPOINTS.POSTS.CREATE,
      payload
    );
    return response.data;
  }

  /**
   * Get post by ID
   * @param id Post ID
   * @returns Post entity
   */
  async getById(id: string): Promise<PostDto> {
    const response = await httpClient.get<PostResponseDto>(
      API_ENDPOINTS.POSTS.GET(id)
    );
    return response.data;
  }

  /**
   * Update existing post
   * @param id Post ID
   * @param payload Partial post update data
   * @returns Updated post
   */
  async update(
    id: string,
    payload: Partial<CreatePostRequestDto>
  ): Promise<PostDto> {
    const response = await httpClient.put<UpdatePostResponseDto>(
      API_ENDPOINTS.POSTS.UPDATE(id),
      payload
    );
    return response.data;
  }

  /**
   * Delete post
   * @param id Post ID to delete
   */
  async delete(id: string): Promise<void> {
    await httpClient.delete<{ message?: string }>(
      API_ENDPOINTS.POSTS.DELETE(id)
    );
  }

  /**
   * Like a post
   * @param id Post ID
   * @returns Updated like status and count
   */
  async like(id: string): Promise<{ isLiked: boolean; likeCount: number }> {
    const response = await httpClient.post<LikeResponseDto>(
      API_ENDPOINTS.POSTS.LIKE(id),
      {}
    );
    return {
      isLiked: response.data.isLiked,
      likeCount: response.data.likeCount,
    };
  }

  /**
   * Unlike a post
   * @param id Post ID
   * @returns Updated like status and count
   */
  async unlike(id: string): Promise<{ isLiked: boolean; likeCount: number }> {
    const response = await httpClient.delete<LikeResponseDto>(
      API_ENDPOINTS.POSTS.UNLIKE(id)
    );
    return {
      isLiked: response.data.isLiked,
      likeCount: response.data.likeCount,
    };
  }

  /**
   * Get paginated list of posts
   * @param params Pagination parameters (cursor, limit)
   * @returns Array of posts
   */
  async list(params?: { cursor?: string; limit?: number }): Promise<PostDto[]> {
    const url = buildUrl(API_ENDPOINTS.POSTS.LIST, params);
    const response = await httpClient.get<PostsListResponseDto>(url);
    return response.data;
  }

  /**
   * Get comments for a post
   * @param postId Post ID
   * @param params Pagination parameters (cursor, limit, offset)
   * @returns Array of comments
   */
  async getComments(
    postId: string,
    params?: { cursor?: string; limit?: number; offset?: number }
  ): Promise<PostCommentDto[]> {
    const url = buildUrl(API_ENDPOINTS.POSTS.COMMENTS(postId), params);
    const response = await httpClient.get<ApiResponse<PostCommentDto[]>>(url);
    return response.data;
  }

  /**
   * Add comment to post
   * @param postId Post ID
   * @param payload Comment data (content)
   * @returns Created comment
   */
  async addComment(
    postId: string,
    payload: CreateCommentRequestDto
  ): Promise<PostCommentDto> {
    const response = await httpClient.post<ApiResponse<PostCommentDto>>(
      API_ENDPOINTS.POSTS.COMMENTS(postId),
      payload
    );
    return response.data;
  }

  /**
   * Get posts by user
   * @param userId User ID
   * @param params Pagination parameters (limit, offset)
   * @returns Array of user's posts
   */
  async listByUser(
    userId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<PostDto[]> {
    const url = buildUrl(API_ENDPOINTS.POSTS.USER(userId), params);
    const response = await httpClient.get<ApiResponse<PostDto[]>>(url);
    return response.data;
  }

  /**
   * Get posts for a journey
   * @param journeyId Journey ID
   * @returns Array of journey posts
   */
  async listByJourney(journeyId: string): Promise<PostDto[]> {
    const response = await httpClient.get<ApiResponse<PostDto[]>>(
      API_ENDPOINTS.POSTS.JOURNEY(journeyId)
    );
    return response.data;
  }

  /**
   * Get replies to a comment
   * @param commentId Comment ID
   * @param params Pagination parameters (limit, offset)
   * @returns Array of reply comments
   */
  async getReplies(
    commentId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<PostCommentDto[]> {
    const url = buildUrl(API_ENDPOINTS.POSTS.REPLIES(commentId), params);
    const response = await httpClient.get<ApiResponse<PostCommentDto[]>>(url);
    return response.data;
  }

  /**
   * Add media to existing post
   * @param postId Post ID
   * @param payload Media data (type, url)
   * @returns Created media entity
   */
  async addMedia(
    postId: string,
    payload: AddMediaRequestDto
  ): Promise<PostMediaDto> {
    const response = await httpClient.post<ApiResponse<PostMediaDto>>(
      API_ENDPOINTS.POSTS.MEDIA(postId),
      payload
    );
    return response.data;
  }

  /**
   * Upload media file
   * @param file Image file to upload
   * @returns S3 image URL and success message
   */
  async uploadMedia(
    file: File
  ): Promise<{ imageUrl: string; message: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await httpClient.request<
      ApiResponse<{ imageUrl: string; message: string }>
    >(API_ENDPOINTS.POSTS.UPLOAD_MEDIA, {
      method: HttpMethod.POST,
      body: formData,
      bodyAsFormData: true,
    });
    return response.data;
  }
}

export const PostApi = new PostApiService();
