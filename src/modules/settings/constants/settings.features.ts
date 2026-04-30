export const SETTINGS_FEATURES = {
  changePassword: process.env.NEXT_PUBLIC_ENABLE_CHANGE_PASSWORD === 'true',
} as const;

export const SETTINGS_LINK_AVAILABILITY = {
  blockedAccounts: false,
  contact: false,
  deleteAccount: false,
  helpCenter: false,
  language: false,
  privacy: false,
  privacyPolicy: false,
  termsOfService: false,
  theme: false,
  whatsNew: false,
} as const;
