import { TripStatePanel } from '@/modules/trips/components/TripStatePanel';

export default function RouteLoading() {
  return <div className="p-5 sm:p-8"><TripStatePanel kind="loading" /></div>;
}
