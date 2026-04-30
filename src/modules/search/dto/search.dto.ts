export type UserSearchResultDto = {
  email?: string | null;
  id: string;
  profileImage?: string | null;
  username: string;
};

export type UserSearchResponseDto = {
  users: UserSearchResultDto[];
};
