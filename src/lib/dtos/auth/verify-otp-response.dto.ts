import { SigninUserDto } from './signin-user.dto';

/**
 * Response DTO for POST /api/auth/verify-otp
 *
 * Backend contract: { data: SigninUserDto }
 *
 * This DTO is for type assertions in route handlers only.
 * API service methods should unwrap `response.data` and return SigninUserDto directly.
 */
export interface VerifyOtpResponseDto {
  data: SigninUserDto;
}
