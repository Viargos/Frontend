export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export interface PostMediaDto {
  id: string;
  postId: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  order: number;
  createdAt: string | Date;
}
