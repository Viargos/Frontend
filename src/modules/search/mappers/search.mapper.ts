import type { UserSearchResultDto } from '@/modules/search/dto/search.dto';
import type { UserSearchResult } from '@/modules/search/types/search.types';

export function mapUserSearchResult(dto: UserSearchResultDto): UserSearchResult {
  return {
    email: dto.email ?? undefined,
    id: dto.id,
    profileImage: dto.profileImage ?? undefined,
    username: dto.username,
  };
}

export function mapUserSearchResults(dtos: UserSearchResultDto[]): UserSearchResult[] {
  return dtos.map(mapUserSearchResult);
}
