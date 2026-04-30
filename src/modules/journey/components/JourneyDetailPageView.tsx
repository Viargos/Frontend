import { notFound } from 'next/navigation';
import { getServerJourneyById } from '../services/journey.server';
import { JourneyDetailView } from './JourneyDetailView';

type JourneyDetailPageViewProps = {
  params: Promise<{ id: string }>;
};

export async function JourneyDetailPageView(props: JourneyDetailPageViewProps) {
  const { id } = await props.params;
  const journey = await getServerJourneyById(id);

  if (!journey) {
    notFound();
  }

  return <JourneyDetailView journey={journey} />;
}
