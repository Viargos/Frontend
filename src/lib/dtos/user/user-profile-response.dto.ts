import { UserDto } from './user.dto';
import { UserStatsDto } from './user-stats.dto';
import { RelationshipStatusDto } from './relationship-status.dto';
import { PostSummaryDto } from './post-summary.dto';
import { JourneySummaryDto } from './journey-summary.dto';

export interface UserProfileResponseDto {
  user: UserDto;
  stats: UserStatsDto;
  relationshipStatus: RelationshipStatusDto;
  recentFollowers: UserDto[];
  recentFollowing: UserDto[];
  recentPosts: PostSummaryDto[];
  recentJourneys: JourneySummaryDto[];
}
