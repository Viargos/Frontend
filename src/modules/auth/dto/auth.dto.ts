export type SigninRequestDto = {
  email: string;
  password: string;
};

export type SignupRequestDto = {
  username: string;
  email: string;
  phoneNumber?: string;
  password: string;
};

export type VerifyOtpRequestDto = {
  email: string;
  otp: string;
};

export type ForgotPasswordRequestDto = {
  email: string;
};

export type ResetPasswordRequestDto = {
  email: string;
  newPassword: string;
};

export type ResendOtpRequestDto = {
  email: string;
};

export type AuthUserDto = {
  id: string;
  email: string;
  username: string;
  profileImage?: string | null;
  isActive: boolean;
};

export type SigninResponseDto = {
  message: string;
  user: AuthUserDto;
  verified: boolean;
  requiresVerification: boolean;
};

export type SigninResponseTransformedDto = AuthUserDto;

export type SignupResponseDto = {
  message: string;
};

export type VerifyOtpResponseDto = {
  message: string;
  user?: AuthUserDto;
  accessToken?: string;
};

export type VerifyOtpResponseTransformedDto = AuthUserDto;

export type ForgotPasswordResponseDto = {
  message: string;
};

export type ResetPasswordResponseDto = {
  message: string;
};

export type RefreshResponseDto = {
  message: string;
};

export type LogoutResponseDto = {
  message: string;
};

export type ProfileResponseDto = {
  id: string;
  email: string;
  username: string;
  profileImage?: string | null;
  isActive: boolean;
};
