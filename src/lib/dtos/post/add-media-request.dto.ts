import { MediaType } from './post-media.dto';

export interface AddMediaRequestDto {
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  order?: number;
}
