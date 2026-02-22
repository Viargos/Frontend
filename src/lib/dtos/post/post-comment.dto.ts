import { UserDto } from '../user/user.dto';

export interface PostCommentDto {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  replyCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  user: UserDto;
  parent?: PostCommentDto;
}
