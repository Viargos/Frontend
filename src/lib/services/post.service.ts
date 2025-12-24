/**
 * Post Service - Migrated Version
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Handles only post-related operations
 * - Open/Closed: Open for extension through interfaces, closed for modification
 * - Liskov Substitution: Implements IPostService interface correctly
 * - Interface Segregation: Depends only on required interface (IHttpClient)
 * - Dependency Inversion: Depends on abstractions (IHttpClient), not concrete implementations
 *
 * Improvements:
 * - Centralized error messages (ERROR_MESSAGES)
 * - Centralized success messages (SUCCESS_MESSAGES)
 * - Structured logging with logger
 * - Better error handling with ErrorHandler
 * - Type-safe implementations (removed `any` types)
 * - Removed duplicate file validation (using FileValidator)
 * - Consistent API response wrapping
 */

import {
  IHttpClient,
  ApiResponse,
} from "@/lib/interfaces/http-client.interface";
import {
  Post,
  CreatePostDto,
  AddMediaDto,
  PostMedia,
  PostComment,
  PostFilters,
  PostResponse,
  PostsResponse,
  PostCountResponse,
} from "@/types/post.types";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { logger } from "@/utils/logger";
import { ErrorHandler } from "@/utils/error-handler";
import { FileValidator } from "@/utils/file-validator";

export interface IPostService {
  createPost(postData: CreatePostDto): Promise<ApiResponse<Post>>;
  addMediaToPost(
    postId: string,
    mediaData: AddMediaDto
  ): Promise<ApiResponse<PostMedia>>;
  getPost(postId: string): Promise<ApiResponse<Post>>;
  getPostsByUser(
    userId: string,
    filters?: PostFilters
  ): Promise<ApiResponse<Post[]>>;
  getPostCount(userId: string): Promise<ApiResponse<{ count: number }>>;
  deletePost(postId: string): Promise<ApiResponse<void>>;
  updatePost(
    postId: string,
    updateData: CreatePostDto
  ): Promise<ApiResponse<Post>>;
  getPublicPosts(limit?: number): Promise<ApiResponse<Post[]>>;
  likePost(postId: string): Promise<ApiResponse<void>>;
  unlikePost(postId: string): Promise<ApiResponse<void>>;
  addComment(
    postId: string,
    content: string,
    parentId?: string
  ): Promise<ApiResponse<PostComment>>;
  deleteComment(commentId: string): Promise<ApiResponse<void>>;
  getComments(
    postId: string,
    filters?: PostFilters
  ): Promise<ApiResponse<PostComment[]>>;
  getReplies(
    commentId: string,
    filters?: PostFilters
  ): Promise<ApiResponse<PostComment[]>>;
  uploadPostMedia(
    file: File
  ): Promise<ApiResponse<{ imageUrl: string; message: string }>>;
}

export class PostService implements IPostService {
  constructor(private httpClient: IHttpClient) {
    logger.debug('PostService initialized');
  }

  /**
   * Create a new post
   */
  async createPost(postData: CreatePostDto): Promise<ApiResponse<Post>> {
    logger.info('Creating post', {
      hasDescription: !!postData.description,
      hasJourneyId: !!postData.journeyId,
      hasLocation: !!postData.location,
    });

    try {
      const response = await this.httpClient.post<Post>("/posts", postData);

      logger.info('Post created successfully', {
        postId: response.data?.id,
      });

      logger.trackEvent('post_created', {
        postId: response.data?.id,
        hasJourney: !!postData.journeyId,
        hasLocation: !!postData.location,
      });

      return this.wrapResponse(response, SUCCESS_MESSAGES.POST.CREATED, 201);
    } catch (error) {
      logger.error('Post creation failed', error as Error, { postData });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.POST.CREATE_FAILED);
    }
  }

  /**
   * Add media to existing post
   */
  async addMediaToPost(
    postId: string,
    mediaData: AddMediaDto
  ): Promise<ApiResponse<PostMedia>> {
    logger.info('Adding media to post', { postId });

    try {
      const response = await this.httpClient.post<PostMedia>(
        `/posts/${postId}/media`,
        mediaData
      );

      logger.info('Media added to post successfully', {
        postId,
        mediaId: response.data?.id,
      });

      logger.trackEvent('post_media_added', {
        postId,
        mediaId: response.data?.id,
      });

      return this.wrapResponse(response, SUCCESS_MESSAGES.POST.MEDIA_UPLOADED, 201);
    } catch (error) {
      logger.error('Failed to add media to post', error as Error, { postId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.POST.ADD_MEDIA_FAILED);
    }
  }

  /**
   * Get a single post by ID
   */
  async getPost(postId: string): Promise<ApiResponse<Post>> {
    logger.debug('Fetching post', { postId });

    try {
      const response = await this.httpClient.get<Post>(`/posts/${postId}`);

      logger.debug('Post fetched successfully', {
        postId,
        hasData: !!response.data,
      });

      return this.wrapResponse(response, 'Post retrieved successfully');
    } catch (error) {
      logger.error('Failed to fetch post', error as Error, { postId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.POST.FETCH_FAILED);
    }
  }

  /**
   * Get posts by user ID
   */
  async getPostsByUser(
    userId: string,
    filters?: PostFilters
  ): Promise<ApiResponse<Post[]>> {
    // Only apply limit/offset if explicitly provided with valid numeric values
    // Check both that the property exists AND that it has a valid numeric value
    const limit = filters?.limit;
    const offset = filters?.offset;
    const hasValidLimit = limit !== undefined && limit !== null && typeof limit === 'number' && !isNaN(limit);
    const hasValidOffset = offset !== undefined && offset !== null && typeof offset === 'number' && !isNaN(offset);

    logger.debug('Fetching user posts', { userId, limit, offset, hasValidLimit, hasValidOffset });

    try {
      const queryParams = new URLSearchParams();
      
      // Only add limit/offset if they have valid numeric values
      if (hasValidLimit && limit !== undefined) {
        queryParams.append("limit", limit.toString());
      }
      if (hasValidOffset && offset !== undefined) {
        queryParams.append("offset", offset.toString());
      }

      const url = queryParams.toString() 
        ? `/posts/user/${userId}?${queryParams.toString()}`
        : `/posts/user/${userId}`;
      
      const response = await this.httpClient.get<Post[]>(url);

      // Log full API response for debugging
      console.log("[API_POSTS_RESPONSE]", {
        userId,
        url,
        statusCode: response.statusCode,
        postsCount: Array.isArray(response.data) ? response.data.length : 0,
        response: response
      });

      logger.debug('User posts fetched successfully', {
        userId,
        count: response.data?.length || 0,
      });

      return {
        statusCode: response.statusCode || 200,
        message: response.message || 'Posts retrieved successfully',
        data: response.data || [],
      };
    } catch (error) {
      logger.error('Failed to fetch user posts', error as Error, { userId, filters });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.POST.FETCH_USER_POSTS_FAILED);
    }
  }

  /**
   * Get post count for user
   */
  async getPostCount(userId: string): Promise<ApiResponse<{ count: number }>> {
    logger.debug('Fetching post count', { userId });

    try {
      const response = await this.httpClient.get<{ count: number }>(
        `/posts/user/${userId}/count`
      );

      logger.debug('Post count fetched', {
        userId,
        count: response.data?.count || 0,
      });

      return {
        statusCode: response.statusCode || 200,
        message: response.message || 'Post count retrieved successfully',
        data: response.data || { count: 0 },
      };
    } catch (error) {
      logger.error('Failed to fetch post count', error as Error, { userId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.POST.FETCH_COUNT_FAILED);
    }
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<ApiResponse<void>> {
    logger.info('Deleting post', { postId });

    try {
      const response = await this.httpClient.delete<void>(`/posts/${postId}`);

      logger.info('Post deleted successfully', { postId });

      logger.trackEvent('post_deleted', { postId });

      return this.wrapResponse(response, SUCCESS_MESSAGES.POST.DELETED);
    } catch (error) {
      logger.error('Failed to delete post', error as Error, { postId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.POST.DELETE_FAILED);
    }
  }

  /**
   * Update a post
   */
  async updatePost(
    postId: string,
    updateData: CreatePostDto
  ): Promise<ApiResponse<Post>> {
    logger.info('Updating post', {
      postId,
      hasDescription: !!updateData.description,
    });

    try {
      const response = await this.httpClient.patch<Post>(
        `/posts/${postId}`,
        updateData
      );

      logger.info('Post updated successfully', { postId });

      logger.trackEvent('post_updated', { postId });

      return this.wrapResponse(response, SUCCESS_MESSAGES.POST.UPDATED);
    } catch (error) {
      logger.error('Failed to update post', error as Error, { postId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.POST.UPDATE_FAILED);
    }
  }

  /**
   * Get public posts
   */
  async getPublicPosts(limit: number = 10): Promise<ApiResponse<Post[]>> {
    logger.debug('Fetching public posts', { limit });

    try {
      const response = await this.httpClient.get<Post[]>(
        `/posts/public?limit=${limit}`
      );

      logger.debug('Public posts fetched', {
        count: response.data?.length || 0,
      });

      return this.wrapResponse(response, 'Public posts fetched successfully');
    } catch (error) {
      logger.error('Failed to fetch public posts', error as Error, { limit });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.POST.FETCH_PUBLIC_POSTS_FAILED);
    }
  }

  /**
   * Like a post
   */
  async likePost(postId: string): Promise<ApiResponse<void>> {
    logger.debug('Liking post', { postId });

    try {
      const response = await this.httpClient.post<void>(
        `/posts/${postId}/like`
      );

      logger.trackEvent('post_liked', { postId });

      return this.wrapResponse(response, SUCCESS_MESSAGES.POST.LIKED);
    } catch (error) {
      logger.error('Failed to like post', error as Error, { postId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.POST.LIKE_FAILED);
    }
  }

  /**
   * Unlike a post
   */
  async unlikePost(postId: string): Promise<ApiResponse<void>> {
    logger.debug('Unliking post', { postId });

    try {
      const response = await this.httpClient.delete<void>(
        `/posts/${postId}/like`
      );

      logger.trackEvent('post_unliked', { postId });

      return this.wrapResponse(response, SUCCESS_MESSAGES.POST.UNLIKED);
    } catch (error) {
      logger.error('Failed to unlike post', error as Error, { postId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.POST.UNLIKE_FAILED);
    }
  }

  /**
   * Add comment to post
   */
  async addComment(
    postId: string,
    content: string,
    parentId?: string
  ): Promise<ApiResponse<PostComment>> {
    logger.info('Adding comment', {
      postId,
      contentLength: content.length,
      isReply: !!parentId,
    });

    try {
      const response = await this.httpClient.post<PostComment>(
        `/posts/${postId}/comments`,
        { content, parentId }
      );

      logger.info('Comment added successfully', {
        postId,
        commentId: response.data?.id,
        isReply: !!parentId,
      });

      logger.trackEvent('comment_added', {
        postId,
        commentId: response.data?.id,
        isReply: !!parentId,
      });

      return this.wrapResponse(response, SUCCESS_MESSAGES.COMMENT.ADDED, 201);
    } catch (error) {
      logger.error('Failed to add comment', error as Error, { postId, parentId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.COMMENT.ADD_FAILED);
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    logger.info('Deleting comment', { commentId });

    try {
      const response = await this.httpClient.delete<void>(
        `/posts/comments/${commentId}`
      );

      logger.info('Comment deleted successfully', { commentId });

      logger.trackEvent('comment_deleted', { commentId });

      return this.wrapResponse(response, SUCCESS_MESSAGES.COMMENT.DELETED);
    } catch (error) {
      logger.error('Failed to delete comment', error as Error, { commentId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.COMMENT.DELETE_FAILED);
    }
  }

  /**
   * Get comments for a post
   */
  async getComments(
    postId: string,
    filters?: PostFilters
  ): Promise<ApiResponse<PostComment[]>> {
    const limit = filters?.limit || 10;
    const offset = filters?.offset || 0;

    logger.debug('Fetching comments', { postId, limit, offset });

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("limit", limit.toString());
      queryParams.append("offset", offset.toString());

      const url = `/posts/${postId}/comments?${queryParams.toString()}`;
      const response = await this.httpClient.get<PostComment[]>(url);

      logger.debug('Comments fetched', {
        postId,
        count: response.data?.length || 0,
      });

      return {
        statusCode: response.statusCode || 200,
        message: response.message || 'Comments retrieved successfully',
        data: response.data || [],
      };
    } catch (error) {
      logger.error('Failed to fetch comments', error as Error, { postId, filters });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.COMMENT.FETCH_FAILED);
    }
  }

  /**
   * Get replies for a comment
   */
  async getReplies(
    commentId: string,
    filters?: PostFilters
  ): Promise<ApiResponse<PostComment[]>> {
    const limit = filters?.limit || 10;
    const offset = filters?.offset || 0;

    logger.debug('Fetching comment replies', { commentId, limit, offset });

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("limit", limit.toString());
      queryParams.append("offset", offset.toString());

      const url = `/posts/comments/${commentId}/replies?${queryParams.toString()}`;
      const response = await this.httpClient.get<PostComment[]>(url);

      logger.debug('Replies fetched', {
        commentId,
        count: response.data?.length || 0,
      });

      return {
        statusCode: response.statusCode || 200,
        message: response.message || 'Replies retrieved successfully',
        data: response.data || [],
      };
    } catch (error) {
      logger.error('Failed to fetch replies', error as Error, { commentId, filters });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.COMMENT.FETCH_REPLIES_FAILED);
    }
  }

  /**
   * Upload post media (image or video)
   * Uses FileValidator to validate before upload (DRY principle)
   */
  async uploadPostMedia(
    file: File
  ): Promise<ApiResponse<{ imageUrl: string; message: string }>> {
    logger.info('Uploading post media', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    try {
      // Validate file using FileValidator utility (eliminates duplicate code)
      FileValidator.validatePostMedia(file);

      // Upload file
      const response = await this.httpClient.uploadFile<{
        imageUrl: string;
        message: string;
      }>("/posts/media", file, "image");

      logger.info('Post media uploaded successfully', {
        fileName: file.name,
        fileSize: file.size,
        imageUrl: response.data?.imageUrl,
      });

      logger.trackEvent('post_media_uploaded', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      return response;
    } catch (error) {
      logger.error('Post media upload failed', error as Error, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.POST.UPLOAD_MEDIA_FAILED);
    }
  }

  /**
   * Wrap API response with consistent format
   * Single Responsibility: Separate response wrapping logic
   *
   * @private
   */
  private wrapResponse<T>(
    response: ApiResponse<T>,
    defaultMessage: string,
    defaultStatusCode: number = 200
  ): ApiResponse<T> {
    return {
      statusCode: response.statusCode || defaultStatusCode,
      message: response.message || defaultMessage,
      data: response.data,
    };
  }
}
