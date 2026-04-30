import { requireAuthenticatedSession } from '@/lib/auth/server-session';
import { DashboardShell } from '@/modules/dashboard';

export default async function ProtectedLayout(props: { children: React.ReactNode }) {
  await requireAuthenticatedSession('/');

  return <DashboardShell>{props.children}</DashboardShell>;
}
