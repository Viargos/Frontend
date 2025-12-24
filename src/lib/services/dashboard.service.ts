/**
 * Dashboard Service - Migrated Version
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Handles only dashboard-related operations
 * - Open/Closed: Open for extension through interfaces, closed for modification
 * - Liskov Substitution: Implements IDashboardService interface correctly
 * - Interface Segregation: Depends only on required interface (IHttpClient)
 * - Dependency Inversion: Depends on abstractions (IHttpClient), not concrete implementations
 *
 * Improvements:
 * - Centralized error messages (ERROR_MESSAGES)
 * - Structured logging with logger
 * - Better error handling with ErrorHandler
 * - Type-safe implementations (removed `any` type)
 * - Event tracking for analytics
 */

import {
    IHttpClient,
    ApiResponse,
} from "@/lib/interfaces/http-client.interface";
import { DashboardFilters, DashboardResponse } from "@/types/dashboard.types";
import { Post } from "@/types/post.types";
import { ERROR_MESSAGES } from "@/constants";
import { logger } from "@/utils/logger";
import { ErrorHandler } from "@/utils/error-handler";

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
    constructor(private httpClient: IHttpClient) {
        logger.debug('DashboardService initialized');
    }

    /**
     * Get dashboard posts with optional filters
     */
    async getDashboardPosts(filters?: DashboardFilters): Promise<
        ApiResponse<{
            posts: Post[];
            nextCursor: string | null;
            hasNextPage: boolean;
            totalCount?: number;
        }>
    > {
        logger.debug('Fetching dashboard posts', {
            hasCursor: !!filters?.cursor,
            limit: filters?.limit,
            hasLocation: !!filters?.location,
            hasSearch: !!filters?.search,
        });

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

            const postCount = response.data?.posts?.length || 0;
            const totalCount = response.data?.totalCount;

            logger.info('Dashboard posts retrieved', {
                postCount,
                totalCount,
                hasNextPage: response.data?.hasNextPage,
                nextCursor: response.data?.nextCursor,
            });

            logger.trackEvent('dashboard_posts_fetched', {
                postCount,
                totalCount,
                filters: {
                    hasLocation: !!filters?.location,
                    hasSearch: !!filters?.search,
                },
            });

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
        } catch (error) {
            logger.error('Failed to fetch dashboard posts', error as Error, {
                filters,
            });

            throw new Error(
                ErrorHandler.extractMessage(error) ||
                ERROR_MESSAGES.DASHBOARD.FETCH_POSTS_FAILED
            );
        }
    }
}
