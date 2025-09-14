import { Post } from "./post.types";

export interface DashboardFilters {
  cursor?: string;
  limit?: number;
  location?: string;
  search?: string;
}

export interface DashboardResponse {
  statusCode: number;
  message: string;
  data: {
    posts: Post[];
    nextCursor: string | null;
    hasNextPage: boolean;
    totalCount?: number;
  };
}

export interface DashboardPostsState {
  posts: Post[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  nextCursor: string | null;
  error: string | null;
}
