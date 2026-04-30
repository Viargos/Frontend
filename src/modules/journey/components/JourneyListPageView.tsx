import { getServerJourneys } from '../services/journey.server';
import { JourneyListView } from './JourneyListView';

export async function JourneyListPageView() {
  const journeys = await getServerJourneys();

  return <JourneyListView initialJourneys={journeys} />;
}
