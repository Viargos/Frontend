import { notFound } from 'next/navigation';
import { getServerJourneyById } from '../services/journey.server';
import { JourneyEditForm } from './JourneyEditForm';

type JourneyEditPageViewProps = {
  params: Promise<{ id: string }>;
};

export async function JourneyEditPageView(props: JourneyEditPageViewProps) {
  const { id } = await props.params;
  const journey = await getServerJourneyById(id);

  if (!journey) {
    notFound();
  }

  return <JourneyEditForm journey={journey} />;
}
