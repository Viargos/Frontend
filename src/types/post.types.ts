import { User } from "./user.types";
import { Journey } from "./journey.types";

export interface Post {
  id: string;
  description: string;
  likeCount: number;
  commentCount: number;
  journeyId?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  journey?: Journey;
  media: PostMedia[];
  likes: PostLike[];
  comments: PostComment[];
  isLikedByCurrentUser?: boolean;
}

export interface PostMedia {
  id: string;
  postId: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  order: number;
  createdAt: string;
}

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
  user: User;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  parent?: PostComment;
  replies?: PostComment[];
}

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
}

export enum PostType {
  JOURNEY_LINKED = "journey_linked",
  STANDALONE = "standalone",
}

// DTOs for API calls
export interface CreatePostDto {
  description: string;
  journeyId?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface AddMediaDto {
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  order?: number;
}

export interface CreatePostFormData {
  type: PostType;
  description: string;
  journeyId?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  media: {
    file: File;
    type: MediaType;
    preview: string;
  }[];
}

export interface PostFilters {
  userId?: string;
  journeyId?: string;
  hasMedia?: boolean;
  limit?: number;
  offset?: number;
}

// API Response types
export interface PostResponse {
  statusCode: number;
  message: string;
  data: Post;
}

export interface PostsResponse {
  statusCode: number;
  message: string;
  data: Post[];
}

export interface PostCountResponse {
  statusCode: number;
  message: string;
  data: { count: number };
}
