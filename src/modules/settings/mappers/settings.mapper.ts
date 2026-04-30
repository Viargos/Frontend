import type { ChangePasswordRequestDto } from '@/modules/settings/dto/settings.dto';
import type { ChangePasswordValues } from '@/modules/settings/validations/settings.validation';

export function mapChangePasswordValuesToDto(values: ChangePasswordValues): ChangePasswordRequestDto {
  return {
    confirmPassword: values.confirmPassword,
    currentPassword: values.currentPassword,
    newPassword: values.newPassword,
  };
}
