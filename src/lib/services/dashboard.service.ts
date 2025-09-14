import {
    IHttpClient,
    ApiResponse,
} from "@/lib/interfaces/http-client.interface";
import { DashboardFilters, DashboardResponse } from "@/types/dashboard.types";
import { Post } from "@/types/post.types";

export interface IDashboardService {
    getDashboardPosts(filters?: DashboardFilters): Promise<
        ApiResponse<{
            posts: Post[];
            nextCursor: string | null;
            hasNextPage: boolean;
            totalCount?: number;
        }>
    >;
}

export class DashboardService implements IDashboardService {
    constructor(private httpClient: IHttpClient) {}

    async getDashboardPosts(filters?: DashboardFilters): Promise<
        ApiResponse<{
            posts: Post[];
            nextCursor: string | null;
            hasNextPage: boolean;
            totalCount?: number;
        }>
    > {
        try {
            const queryParams = new URLSearchParams();

            // Add query parameters
            if (filters?.cursor) {
                queryParams.append("cursor", filters.cursor);
            }
            if (filters?.limit) {
                queryParams.append("limit", filters.limit.toString());
            }
            if (filters?.location) {
                queryParams.append("location", filters.location);
            }
            if (filters?.search) {
                queryParams.append("search", filters.search);
            }

            const url = `/dashboard${
                queryParams.toString() ? `?${queryParams.toString()}` : ""
            }`;

            const response = await this.httpClient.get<{
                posts: Post[];
                nextCursor: string | null;
                hasNextPage: boolean;
                totalCount?: number;
            }>(url);

            return {
                statusCode: response.statusCode || 200,
                message:
                    response.message ||
                    "Dashboard posts retrieved successfully",
                data: response.data || {
                    posts: [],
                    nextCursor: null,
                    hasNextPage: false,
                },
            };
        } catch (error: any) {
            throw new Error(error.message || "Failed to fetch dashboard posts");
        }
    }
}
