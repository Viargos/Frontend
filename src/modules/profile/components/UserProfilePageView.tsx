import { notFound } from 'next/navigation';
import { getServerProfileById } from '../services/profile.server';
import { profileIdSchema } from '../validations/profile.validation';
import { ProfileContent } from './ProfileContent';

type UserProfilePageViewProps = {
  params: Promise<{ userId: string }>;
};

export async function UserProfilePageView(props: UserProfilePageViewProps) {
  const { userId } = await props.params;

  const parsed = profileIdSchema.safeParse(userId);
  if (!parsed.success) {
    notFound();
  }

  let profile;
  try {
    profile = await getServerProfileById(userId);
  } catch {
    notFound();
  }

  return (
    <ProfileContent
      heading={`${profile.user.username}'s Profile`}
      isOwnProfile={false}
      profile={profile}
    />
  );
}
