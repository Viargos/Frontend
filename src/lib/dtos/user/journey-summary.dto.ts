export interface JourneySummaryDto {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  daysCount: number;
  createdAt: string | Date;
  author: {
    id: string;
    username: string;
    profileImage?: string;
  };
  previewPlaces: string[];
  type: string;
}
