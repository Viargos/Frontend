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
  constructor(private httpClient: IHttpClient) {}

  async createPost(postData: CreatePostDto): Promise<ApiResponse<Post>> {
    try {
      const response = await this.httpClient.post<Post>("/posts", postData);
      return {
        statusCode: response.statusCode || 201,
        message: response.message || "Post created successfully",
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to create post");
    }
  }

  async addMediaToPost(
    postId: string,
    mediaData: AddMediaDto
  ): Promise<ApiResponse<PostMedia>> {
    try {
      const response = await this.httpClient.post<PostMedia>(
        `/posts/${postId}/media`,
        mediaData
      );
      return {
        statusCode: response.statusCode || 201,
        message: response.message || "Media added successfully",
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to add media to post");
    }
  }

  async getPost(postId: string): Promise<ApiResponse<Post>> {
    try {
      const response = await this.httpClient.get<Post>(`/posts/${postId}`);
      return {
        statusCode: response.statusCode || 200,
        message: response.message || "Post retrieved successfully",
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch post");
    }
  }

  async getPostsByUser(
    userId: string,
    filters?: PostFilters
  ): Promise<ApiResponse<Post[]>> {
    try {
      const queryParams = new URLSearchParams();
      const limit = filters?.limit || 10;
      const offset = filters?.offset || 0;

      queryParams.append("limit", limit.toString());
      queryParams.append("offset", offset.toString());

      const url = `/posts/user/${userId}?${queryParams.toString()}`;
      const response = await this.httpClient.get<Post[]>(url);

      return {
        statusCode: response.statusCode || 200,
        message: response.message || "Posts retrieved successfully",
        data: response.data || [],
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch user posts");
    }
  }

  async getPostCount(userId: string): Promise<ApiResponse<{ count: number }>> {
    try {
      const response = await this.httpClient.get<{ count: number }>(
        `/posts/user/${userId}/count`
      );
      return {
        statusCode: response.statusCode || 200,
        message: response.message || "Post count retrieved successfully",
        data: response.data || { count: 0 },
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch post count");
    }
  }

  async likePost(postId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.httpClient.post<void>(
        `/posts/${postId}/like`
      );
      return {
        statusCode: response.statusCode || 200,
        message: response.message || "Post liked successfully",
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to like post");
    }
  }

  async unlikePost(postId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.httpClient.delete<void>(
        `/posts/${postId}/like`
      );
      return {
        statusCode: response.statusCode || 200,
        message: response.message || "Post unliked successfully",
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to unlike post");
    }
  }

  async addComment(
    postId: string,
    content: string,
    parentId?: string
  ): Promise<ApiResponse<PostComment>> {
    try {
      const response = await this.httpClient.post<PostComment>(
        `/posts/${postId}/comments`,
        {
          content,
          parentId,
        }
      );
      return {
        statusCode: response.statusCode || 201,
        message: response.message || "Comment added successfully",
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to add comment");
    }
  }

  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.httpClient.delete<void>(
        `/posts/comments/${commentId}`
      );
      return {
        statusCode: response.statusCode || 200,
        message: response.message || "Comment deleted successfully",
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete comment");
    }
  }

  async getComments(
    postId: string,
    filters?: PostFilters
  ): Promise<ApiResponse<PostComment[]>> {
    try {
      const queryParams = new URLSearchParams();
      const limit = filters?.limit || 10;
      const offset = filters?.offset || 0;

      queryParams.append("limit", limit.toString());
      queryParams.append("offset", offset.toString());

      const url = `/posts/${postId}/comments?${queryParams.toString()}`;
      const response = await this.httpClient.get<PostComment[]>(url);

      return {
        statusCode: response.statusCode || 200,
        message: response.message || "Comments retrieved successfully",
        data: response.data || [],
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch comments");
    }
  }

  async getReplies(
    commentId: string,
    filters?: PostFilters
  ): Promise<ApiResponse<PostComment[]>> {
    try {
      const queryParams = new URLSearchParams();
      const limit = filters?.limit || 10;
      const offset = filters?.offset || 0;

      queryParams.append("limit", limit.toString());
      queryParams.append("offset", offset.toString());

      const url = `/posts/comments/${commentId}/replies?${queryParams.toString()}`;
      const response = await this.httpClient.get<PostComment[]>(url);

      return {
        statusCode: response.statusCode || 200,
        message: response.message || "Replies retrieved successfully",
        data: response.data || [],
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch replies");
    }
  }

  // Media upload for posts - following DRY principle from profile service
  async uploadPostMedia(
    file: File
  ): Promise<ApiResponse<{ imageUrl: string; message: string }>> {
    this.validateImageFile(file);
    return (this.httpClient as any).uploadFile<{
      imageUrl: string;
      message: string;
    }>("/posts/media", file, "image");
  }

  private validateImageFile(file: File): void {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, WebP and GIF images are allowed."
      );
    }

    if (file.size > maxSize) {
      throw new Error("File size too large. Maximum size is 10MB.");
    }
  }
}
