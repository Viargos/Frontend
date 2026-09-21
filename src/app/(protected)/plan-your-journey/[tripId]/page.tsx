import { TripWorkspacePageView } from '@/modules/trips';

export default async function TripWorkspacePage(props: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await props.params;
  return <TripWorkspacePageView tripId={tripId} />;
}
