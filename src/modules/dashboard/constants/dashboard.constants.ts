import { DashboardRoute } from '@/modules/dashboard/enums/dashboard.enum';

export const DASHBOARD_DEFAULT_LIMIT = 10;
export const DASHBOARD_RECOMMENDATIONS_INITIAL_LIMIT = 5;
export const DASHBOARD_RECOMMENDATIONS_LOAD_MORE_LIMIT = 3;
export const DASHBOARD_POPULAR_JOURNEYS_LIMIT = 3;

export const DASHBOARD_NAV_ITEMS = [
  { label: 'Home', href: DashboardRoute.DASHBOARD, icon: 'home' },
  { label: 'Explore', href: DashboardRoute.DISCOVER, icon: 'explore' },
  { label: 'Profile', href: DashboardRoute.PROFILE, icon: 'profile' },
  { label: 'Messages', href: DashboardRoute.MESSAGES, icon: 'messages' },
  { label: 'Plan Your Journey', href: DashboardRoute.PLAN_YOUR_JOURNEY, icon: 'plan', badge: 'Coming Soon' },
  { label: 'Settings', href: DashboardRoute.SETTINGS, icon: 'settings' },
] as const;
