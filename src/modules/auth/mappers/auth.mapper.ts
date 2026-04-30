import type {
  AuthUserDto,
  ProfileResponseDto,
  SigninResponseDto,
  SigninResponseTransformedDto,
  VerifyOtpResponseDto,
  VerifyOtpResponseTransformedDto,
} from '@/modules/auth/dto/auth.dto';
import type { AuthSigninResult, AuthUser } from '@/modules/auth/types/auth.types';

function mapUserDtoToDomain(dto: AuthUserDto): AuthUser {
  return {
    email: dto.email,
    id: dto.id,
    isActive: dto.isActive,
    profileImage: dto.profileImage ?? null,
    username: dto.username,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAuthUserDto(value: unknown): value is AuthUserDto {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string'
    && typeof value.email === 'string'
    && typeof value.username === 'string'
    && typeof value.isActive === 'boolean'
  );
}

export function mapSigninResponseToResult(
  dto: SigninResponseDto | SigninResponseTransformedDto,
): AuthSigninResult {
  if (isAuthUserDto(dto)) {
    return {
      requiresVerification: !dto.isActive,
      user: mapUserDtoToDomain(dto),
      verified: dto.isActive,
    };
  }

  return {
    requiresVerification: dto.requiresVerification ?? !dto.user.isActive,
    user: mapUserDtoToDomain(dto.user),
    verified: dto.verified ?? dto.user.isActive,
  };
}

export function mapVerifyOtpResponseToUser(
  dto: VerifyOtpResponseDto | VerifyOtpResponseTransformedDto,
): AuthUser | null {
  if (isAuthUserDto(dto)) {
    return mapUserDtoToDomain(dto);
  }

  if (!dto.user) {
    return null;
  }

  return mapUserDtoToDomain(dto.user);
}

export function mapProfileResponseToUser(dto: ProfileResponseDto): AuthUser {
  return {
    email: dto.email,
    id: dto.id,
    isActive: dto.isActive,
    profileImage: dto.profileImage ?? null,
    username: dto.username,
  };
}
