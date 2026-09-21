'use client';

import type { LucideIcon } from 'lucide-react';
import type { TripWorkspaceTab } from '@/modules/trips/types/trip.types';
import {
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  Inbox,
  LayoutList,
  Radio,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Badge, Button } from '@/modules/common/components/ui';
import { TRIP_COPY } from '@/modules/trips/copy/trip.copy';
import { formatTripDateRange, getTripStateLabel } from '@/modules/trips/helpers/trip-format';
import { useNetworkStatus } from '@/modules/trips/hooks/use-network-status';
import { useTripActions, useTripDetail, useTripWorkspaceSection } from '@/modules/trips/hooks/use-trips';
import { TripStatePanel } from './TripStatePanel';
import { TripWorkspaceContent } from './TripWorkspaceContent';

const tabs: Array<{ icon: LucideIcon; id: TripWorkspaceTab; label: string }> = [
  { icon: CircleDot, id: 'overview', label: TRIP_COPY.tabs.overview },
  { icon: Inbox, id: 'inbox', label: TRIP_COPY.tabs.inbox },
  { icon: LayoutList, id: 'plan', label: TRIP_COPY.tabs.plan },
  { icon: Users, id: 'collaboration', label: TRIP_COPY.tabs.collaboration },
  { icon: ShieldCheck, id: 'readiness', label: TRIP_COPY.tabs.readiness },
  { icon: Radio, id: 'live', label: TRIP_COPY.tabs.live },
  { icon: CheckCircle2, id: 'post-trip', label: TRIP_COPY.tabs.postTrip },
];

function isTab(value: string | null): value is TripWorkspaceTab {
  return tabs.some(tab => tab.id === value);
}

export function TripWorkspacePageView(props: { tripId: string }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TripWorkspaceTab = isTab(tabParam) ? tabParam : 'overview';
  const online = useNetworkStatus();
  const detail = useTripDetail(props.tripId);
  const section = useTripWorkspaceSection(props.tripId, activeTab);
  const actions = useTripActions(props.tripId, detail.data?.revision ?? 0);

  if (detail.isLoading) {
    return <div className="p-5 sm:p-8"><TripStatePanel kind="loading" /></div>;
  }

  if (detail.error || !detail.data) {
    const error = detail.error;
    return (
      <div className="p-5 sm:p-8">
        <TripStatePanel
          action={<Button onClick={() => detail.refetch()}>{TRIP_COPY.actions.refresh}</Button>}
          kind={error instanceof Error && 'statusCode' in error && error.statusCode === 403 ? 'denied' : 'error'}
          message={error instanceof Error ? error.message : undefined}
        />
      </div>
    );
  }

  const actionErrorKind = actions.error?.statusCode === 409 ? 'conflict' : 'error';
  const workspaceData = {
    activity: section.activity,
    comments: section.comments,
    days: section.days,
    findings: section.findings,
    inbox: section.inbox,
    items: section.items,
    members: section.members,
    offlineSnapshot: section.offlineSnapshot,
    proposals: section.proposals,
    publishDraft: actions.publishPreview,
    readiness: section.readiness,
    routeLegs: [],
    votes: section.votes,
  };

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <header className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#160E53]" href="/plan-your-journey">
            <ArrowLeft aria-hidden className="h-4 w-4" />
            {TRIP_COPY.workspace.back}
          </Link>
          <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{getTripStateLabel(detail.data.state)}</Badge>
                <Badge variant="muted">{TRIP_COPY.labels[detail.data.role.toLowerCase() as 'editor' | 'owner' | 'viewer']}</Badge>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${online ? 'text-emerald-700' : 'text-amber-700'}`}>
                  <span className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {online ? TRIP_COPY.status.connected : TRIP_COPY.status.offline}
                </span>
              </div>
              <h1 className="mt-3 font-[Outfit] text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{detail.data.title}</h1>
              <p className="mt-2 text-sm text-slate-500">
                {formatTripDateRange(detail.data)}
                {' '}
                ·
                {' '}
                {TRIP_COPY.workspace.revision}
                {' '}
                {new Intl.NumberFormat().format(detail.data.revision)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <nav aria-label={TRIP_COPY.headings.trips} className="sticky top-0 z-20 overflow-x-auto border-b border-slate-200 bg-white/92 px-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl min-w-max gap-1 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                aria-current={activeTab === tab.id ? 'page' : undefined}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition ${activeTab === tab.id ? 'bg-[#160E53] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
                href={`/plan-your-journey/${props.tripId}?tab=${tab.id}`}
                key={tab.id}
              >
                <Icon aria-hidden className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8" tabIndex={-1}>
        {!online ? <div className="mb-5"><TripStatePanel kind="offline" /></div> : null}
        {actions.error ? <div className="mb-5"><TripStatePanel kind={actionErrorKind} message={actions.error.message} /></div> : null}
        {section.isLoading ? <TripStatePanel kind="loading" /> : null}
        {section.error
          ? <TripStatePanel kind={section.error.statusCode === 403 ? 'denied' : section.error.statusCode === 409 ? 'conflict' : 'error'} message={section.error.message} />
          : null}
        {!section.isLoading && !section.error
          ? (
              <TripWorkspaceContent
                actions={{
                  applyProposal: actions.applyProposal,
                  isPending: actions.isPending,
                  publishDraft: () => actions.publishDraft(undefined),
                  recalculate: actions.recalculate,
                  recordActual: actions.recordActual,
                  startLive: actions.startLive,
                }}
                data={workspaceData}
                tab={activeTab}
                trip={detail.data}
              />
            )
          : null}
      </main>
    </div>
  );
}
