import { UserProfilePageView } from '@/modules/profile';

export default async function UserProfilePage(props: { params: Promise<{ userId: string }> }) {
  return <UserProfilePageView params={props.params} />;
}
