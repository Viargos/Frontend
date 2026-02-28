import { DashboardPageView } from '@/modules/dashboard';

export default async function DashboardPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <DashboardPageView searchParams={props.searchParams} />;
}
