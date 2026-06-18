import { notFound } from 'next/navigation';
import { profileIdSchema } from '../validations/profile.validation';
import { ProfileQueryView } from './ProfileQueryView';

type UserProfilePageViewProps = {
  params: Promise<{ userId: string }>;
};

export async function UserProfilePageView(props: UserProfilePageViewProps) {
  const { userId } = await props.params;

  const parsed = profileIdSchema.safeParse(userId);
  if (!parsed.success) {
    notFound();
  }

  return <ProfileQueryView isOwnProfile={false} userId={userId} />;
}
