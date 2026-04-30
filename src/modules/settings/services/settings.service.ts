import type { ChangePasswordRequestDto, ChangePasswordResponseDto } from '@/modules/settings/dto/settings.dto';
import { httpClient } from '@/lib/api/http-client';
import { SETTINGS_FEATURES } from '@/modules/settings/constants';

export const settingsService = {
  async changePassword(_: ChangePasswordRequestDto): Promise<ChangePasswordResponseDto> {
    if (!SETTINGS_FEATURES.changePassword) {
      throw new Error('Change password is currently unavailable');
    }

    throw new Error('Change password endpoint is not configured');
  },

  async logout(): Promise<void> {
    await httpClient.post('/auth/logout');
  },
};
