export type ChangePasswordRequestDto = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordResponseDto = {
  success: boolean;
  message: string;
};
