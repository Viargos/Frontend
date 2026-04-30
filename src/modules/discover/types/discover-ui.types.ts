export type DiscoverEntityType = 'journey' | 'post';

export type DiscoverFeedItem = {
  id: string;
  type: DiscoverEntityType;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  locationLabel: string;
  creator: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  tags: string[];
  latitude: number;
  longitude: number;
  popularity?: number;
  createdAt: string;
  journeyId?: string;
};
