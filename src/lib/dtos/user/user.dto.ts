export interface UserDto {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  profileImage?: string;
  bannerImage?: string;
}
