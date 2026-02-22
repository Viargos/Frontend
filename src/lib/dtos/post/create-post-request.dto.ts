export interface CreatePostRequestDto {
  description: string;
  journeyId?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}
