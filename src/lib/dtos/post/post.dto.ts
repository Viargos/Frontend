import { UserDto } from '../user/user.dto';
import { PostMediaDto } from './post-media.dto';
import { PostCommentDto } from './post-comment.dto';

export interface PostDto {
  id: string;
  description: string;
  likeCount: number;
  commentCount: number;
  journeyId?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  user: UserDto;
  journey?: {
    id: string;
    title: string;
  };
  media: PostMediaDto[];
  likes?: Array<{
    id: string;
    postId: string;
    userId: string;
    createdAt: string | Date;
    user: UserDto;
  }>;
  comments?: PostCommentDto[];
  isLikedByCurrentUser?: boolean;
  isLikedByUser?: boolean;
}
