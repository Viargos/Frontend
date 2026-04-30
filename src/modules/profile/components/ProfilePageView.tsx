import { getProfileParityFixture } from '../constants/profile-parity.fixtures';
import { getServerCurrentProfile } from '../services/profile.server';
import { ProfileContent } from './ProfileContent';

type ProfilePageViewProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function ProfilePageView(props: ProfilePageViewProps) {
  const searchParams = await props.searchParams;
  const parityEnabled = process.env.PARITY === 'true' && searchParams.parityFixtures === '1';
  const profile = parityEnabled ? getProfileParityFixture() : await getServerCurrentProfile();

  return <ProfileContent isOwnProfile={true} profile={profile} />;
}
