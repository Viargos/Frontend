export type NotificationCategory
  = | 'account_security'
    | 'errors_warnings'
    | 'messages_activity'
    | 'product_system'
    | 'reminders'
    | 'success'
    | 'task_workflow';

export type NotificationAction = {
  action: string;
  title: string;
  url?: string;
};

export type NotificationItem = {
  actions: NotificationAction[];
  category: NotificationCategory;
  createdAt: string;
  destinationUrl: string;
  dismissedAt: string | null;
  eventType: string;
  id: string;
  isRead: boolean;
  message: string;
  readAt: string | null;
  scheduledAt: string | null;
  title: string;
};

export type NotificationCategoryPreferences = {
  accountSecurity: boolean;
  errorsWarnings: boolean;
  messagesActivity: boolean;
  productSystem: boolean;
  reminders: boolean;
  success: boolean;
  taskWorkflow: boolean;
};

export type NotificationPreferences = {
  browserEnabled: boolean;
  categories: NotificationCategoryPreferences;
  detailedPreviewEnabled: boolean;
  groupingEnabled: boolean;
  immediateEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursEnd: string;
  quietHoursStart: string;
  soundEnabled: boolean;
  suppressDuplicatesEnabled: boolean;
  timezone: string;
};

export type NotificationList = {
  items: NotificationItem[];
  pagination: {
    hasMore: boolean;
    limit: number;
    offset: number;
    total: number;
  };
  unreadCount: number;
};

export type BrowserNotificationConfiguration = {
  publicKey: string | null;
  supported: boolean;
};

export type BrowserPermissionStatus
  = | NotificationPermission
    | 'unsupported';

export type RegisterPushSubscriptionInput = {
  auth: string;
  deviceId: string;
  endpoint: string;
  p256dh: string;
  permission: NotificationPermission;
};

export type UpdateNotificationPreferencesInput = Partial<
  Omit<NotificationPreferences, 'categories'>
> & {
  categories?: Partial<NotificationCategoryPreferences>;
};
