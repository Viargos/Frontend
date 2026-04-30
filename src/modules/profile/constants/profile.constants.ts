import { ProfileTab } from '@/modules/profile/enums/profile-tab.enum';

export const PROFILE_TABS = [
  { id: ProfileTab.JOURNEY, label: 'Journey' },
  { id: ProfileTab.POST, label: 'Post' },
  { id: ProfileTab.MAP, label: 'Map' },
] as const;
