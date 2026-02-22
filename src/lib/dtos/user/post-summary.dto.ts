export interface PostSummaryDto {
  id: string;
  description: string;
  likeCount: number;
  commentCount: number;
  createdAt: string | Date;
  mediaUrls: string[];
}
