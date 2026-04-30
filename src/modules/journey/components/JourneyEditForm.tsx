'use client';

import type { JourneyDetail } from '@/modules/journey/types/journey-detail.types';
import { JourneyPlannerForm } from './JourneyPlannerForm';

type JourneyEditFormProps = {
  journey: JourneyDetail;
};

export const JourneyEditForm = (props: JourneyEditFormProps) => {
  const { journey } = props;
  return <JourneyPlannerForm initialJourney={journey} mode="edit" />;
};
