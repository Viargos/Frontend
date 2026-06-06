import { getProfileParityFixture } from '../constants/profile-parity.fixtures';
import { ProfileQueryView } from './ProfileQueryView';

type ProfilePageViewProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function ProfilePageView(props: ProfilePageViewProps) {
  const searchParams = await props.searchParams;
  const parityEnabled = process.env.PARITY === 'true' && searchParams.parityFixtures === '1';

  return (
    <ProfileQueryView
      initialProfile={parityEnabled ? getProfileParityFixture() : undefined}
      isOwnProfile={true}
    />
  );
}
