import { JourneyDetailPageView } from '@/modules/journey';

export default async function JourneyDetailPage(props: { params: Promise<{ id: string }> }) {
  return <JourneyDetailPageView params={props.params} />;
}
