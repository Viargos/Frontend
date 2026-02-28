import { JourneyEditPageView } from '@/modules/journey';

export default async function EditJourneyPage(props: { params: Promise<{ id: string }> }) {
  return <JourneyEditPageView params={props.params} />;
}
