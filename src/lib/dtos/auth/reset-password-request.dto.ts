export interface ResetPasswordRequestDto {
  newPassword: string;
  email?: string;
  otp?: string;
}
