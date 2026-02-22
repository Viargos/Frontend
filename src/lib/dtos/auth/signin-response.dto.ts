import { SigninUserDto } from './signin-user.dto';

/**
 * Response DTO for POST /api/auth/signin
 *
 * Backend contract: { data: SigninUserDto }
 *
 * This DTO is for type assertions in route handlers only.
 * API service methods should unwrap `response.data` and return SigninUserDto directly.
 */
export interface SigninResponseDto {
  data: SigninUserDto;
}
