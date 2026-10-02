'use client';

import { useEffect } from 'react';
import { reportError } from '@/lib/monitoring';
import { Button } from '@/modules/common/components/ui';
import { TripStatePanel } from '@/modules/trips/components/TripStatePanel';
import { TRIP_COPY } from '@/modules/trips/copy/trip.copy';

export default function TripWorkspaceError(props: { error: Error; reset: () => void }) {
  useEffect(() => {
    reportError(props.error, { route: 'src/app/(protected)/plan-your-journey/[tripId]' });
  }, [props.error]);

  return (
    <div className="p-5 sm:p-8">
      <TripStatePanel
        action={<Button onClick={props.reset}>{TRIP_COPY.actions.refresh}</Button>}
        kind="error"
        message={props.error.message}
      />
    </div>
  );
}
