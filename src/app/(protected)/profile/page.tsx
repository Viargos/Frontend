import { ProfilePageView } from '@/modules/profile/components';

export default async function ProfilePage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <ProfilePageView searchParams={props.searchParams} />;
}
