'use client';

import type {
  Trip,
  TripWorkspaceData,
  TripWorkspaceTab,
} from '@/modules/trips/types/trip.types';
import {
  ArrowRight,
  Check,
  CircleDot,
  CloudDownload,
  LockKeyhole,
  Map,
  MessageCircle,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Badge, Button } from '@/modules/common/components/ui';
import { TRIP_COPY } from '@/modules/trips/copy/trip.copy';
import { formatTripTimestamp } from '@/modules/trips/helpers/trip-format';

type ContentProps = {
  actions: {
    applyProposal: (input: { selectedOperationIndexes: number[]; proposalId: string }) => Promise<unknown>;
    isPending: boolean;
    publishDraft: () => Promise<unknown>;
    recalculate: () => Promise<unknown>;
    recordActual: (input: { itemId: string; status: 'COMPLETED' | 'DELAYED' | 'SKIPPED' }) => Promise<unknown>;
    startLive: () => Promise<Trip>;
  };
  data: TripWorkspaceData;
  tab: TripWorkspaceTab;
  trip: Trip;
};

function renderOverview(props: ContentProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#160E53]/55 uppercase">{TRIP_COPY.headings.overview}</p>
        <h2 className="mt-3 font-[Outfit] text-3xl font-semibold tracking-tight text-slate-950">{props.trip.title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{props.trip.description ?? TRIP_COPY.workspace.destinationsPending}</p>
        <div className="mt-7 flex items-center gap-2" aria-hidden>
          <span className="h-3 w-3 rounded-full border-[3px] border-[#160E53] bg-white" />
          <span className="h-0.5 flex-1 bg-linear-to-r from-[#160E53] via-[#f8d775] to-slate-200" />
          {props.trip.destinations.slice(0, 5).map(destination => (
            <span className="h-3 w-3 rounded-full bg-[#f8d775] ring-4 ring-[#f8d775]/20" key={destination.id} />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {props.trip.destinations.length > 0
            ? props.trip.destinations.map(destination => <Badge key={destination.id}>{destination.name}</Badge>)
            : <Badge variant="muted">{TRIP_COPY.workspace.destinationsPending}</Badge>}
        </div>
      </section>
      <aside className="rounded-[28px] bg-[#160E53] p-6 text-white">
        <ShieldCheck aria-hidden className="h-7 w-7 text-[#f8d775]" />
        <h2 className="mt-5 font-[Outfit] text-xl font-semibold">{TRIP_COPY.headings.readiness}</h2>
        <p className="mt-2 text-sm leading-6 text-white/65">{TRIP_COPY.readiness.description}</p>
        <Button className="mt-6 bg-white text-[#160E53] hover:bg-white/90" onClick={() => props.actions.recalculate()}>{TRIP_COPY.actions.recalculate}</Button>
      </aside>
    </div>
  );
}

function renderInbox(props: ContentProps) {
  if (props.data.inbox.length === 0) {
    return <EmptyMessage icon={<CircleDot className="h-5 w-5" />} message={TRIP_COPY.empty.inbox} />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {props.data.inbox.map(item => (
        <article className="rounded-[24px] border border-slate-200 bg-white p-5" key={item.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge>{item.placeSnapshot.type}</Badge>
                {item.tags.map(tag => <Badge key={tag} variant="muted">{tag}</Badge>)}
              </div>
              <h2 className="mt-3 font-[Outfit] text-lg font-semibold text-slate-950">{item.placeSnapshot.name}</h2>
              {item.attribution ? <p className="mt-2 text-xs text-slate-500">{item.attribution}</p> : null}
            </div>
          </div>
          {item.notes ? <p className="mt-4 text-sm text-slate-600">{item.notes}</p> : null}
        </article>
      ))}
    </div>
  );
}

function renderPlan(props: ContentProps, view: 'board' | 'map' | 'timeline', setView: (value: 'board' | 'map' | 'timeline') => void) {
  const sortedDays = [...props.data.days].sort((left, right) => left.sequence - right.sequence);
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1" role="group">
          {(['board', 'map', 'timeline'] as const).map(option => (
            <button
              aria-pressed={view === option}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${view === option ? 'bg-[#160E53] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              key={option}
              onClick={() => setView(option)}
              type="button"
            >
              {TRIP_COPY.plan[option]}
            </button>
          ))}
        </div>
        <Button disabled={props.actions.isPending || props.trip.role === 'VIEWER'} onClick={() => props.actions.recalculate()} variant="outline">
          <Route aria-hidden className="h-4 w-4" />
          {TRIP_COPY.actions.recalculate}
        </Button>
      </div>

      {sortedDays.length === 0
        ? <EmptyMessage icon={<Route className="h-5 w-5" />} message={TRIP_COPY.empty.items} />
        : (
            <div className={view === 'board' ? 'grid gap-4 xl:grid-cols-2' : 'space-y-4'}>
              {view === 'map'
                ? (
                    <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eef2f7_25%,transparent_25%),linear-gradient(225deg,#eef2f7_25%,transparent_25%),linear-gradient(45deg,#eef2f7_25%,transparent_25%),linear-gradient(315deg,#eef2f7_25%,#f8fafc_25%)] bg-[length:32px_32px] p-8">
                      <Map aria-hidden className="h-7 w-7 text-[#160E53]" />
                      <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">{TRIP_COPY.plan.mapDescription}</p>
                    </div>
                  )
                : null}
              {sortedDays.map(day => (
                <section className="rounded-[26px] border border-slate-200 bg-white p-5" key={day.id}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.18em] text-[#160E53]/55 uppercase">{day.localDate ?? day.timezone}</p>
                      <h2 className="mt-1 font-[Outfit] text-lg font-semibold text-slate-950">{day.title ?? `${TRIP_COPY.plan.timeline} ${new Intl.NumberFormat().format(day.sequence)}`}</h2>
                    </div>
                    {day.isLocked ? <LockKeyhole aria-label={TRIP_COPY.labels.blocking} className="h-4 w-4 text-slate-500" /> : null}
                  </div>
                  <ol className="relative mt-5 space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-linear-to-b before:from-[#160E53] before:via-[#f8d775] before:to-slate-200">
                    {props.data.items
                      .filter(item => item.dayId === day.id)
                      .sort((left, right) => left.sequence - right.sequence)
                      .map(item => (
                        <li className="relative flex gap-4 pl-0" key={item.id}>
                          <span className={`relative mt-1 h-4 w-4 shrink-0 rounded-full border-[3px] bg-white ${item.isAnchor ? 'border-[#f8d775]' : 'border-[#160E53]'}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-500">{item.startTime ?? TRIP_COPY.plan.unknownHours}</p>
                          </div>
                        </li>
                      ))}
                  </ol>
                </section>
              ))}
            </div>
          )}
    </div>
  );
}

function renderCollaboration(props: ContentProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-[26px] border border-slate-200 bg-white p-5">
        <h2 className="flex items-center gap-2 font-[Outfit] text-lg font-semibold text-slate-950">
          <Users className="h-5 w-5 text-[#160E53]" />
          {TRIP_COPY.sections.members}
        </h2>
        <div className="mt-5 space-y-3">
          {props.data.members.length === 0
            ? <p className="text-sm text-slate-500">{TRIP_COPY.empty.members}</p>
            : props.data.members.map(member => (
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3" key={member.id}>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{member.user?.username ?? member.user?.email ?? member.userId}</p>
                    <p className="text-xs text-slate-500">{member.user?.email}</p>
                  </div>
                  <Badge variant={member.status === 'ACTIVE' ? 'success' : 'muted'}>{TRIP_COPY.labels[member.role.toLowerCase() as 'editor' | 'owner' | 'viewer']}</Badge>
                </div>
              ))}
        </div>
      </section>
      <section className="rounded-[26px] border border-slate-200 bg-white p-5">
        <h2 className="flex items-center gap-2 font-[Outfit] text-lg font-semibold text-slate-950">
          <MessageCircle className="h-5 w-5 text-[#160E53]" />
          {TRIP_COPY.sections.comments}
        </h2>
        <div className="mt-5 space-y-3">
          {props.data.comments.length === 0
            ? <p className="text-sm text-slate-500">{TRIP_COPY.empty.comments}</p>
            : props.data.comments.map(comment => (
                <article className="rounded-2xl border border-slate-100 p-4" key={comment.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{comment.user?.username ?? comment.user?.email ?? comment.userId}</p>
                    <time className="text-xs text-slate-400">{formatTripTimestamp(comment.createdAt, props.trip.timezone)}</time>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{comment.body}</p>
                </article>
              ))}
        </div>
      </section>
      <section className="rounded-[26px] border border-slate-200 bg-white p-5 xl:col-span-2">
        <h2 className="font-[Outfit] text-lg font-semibold text-slate-950">{TRIP_COPY.sections.recentActivity}</h2>
        <ol className="mt-4 divide-y divide-slate-100">
          {props.data.activity.data.length === 0
            ? <li className="py-3 text-sm text-slate-500">{TRIP_COPY.empty.activity}</li>
            : props.data.activity.data.map(event => (
                <li className="flex items-start justify-between gap-5 py-3" key={event.id}>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-950">{event.actor?.username ?? event.actor?.email ?? event.actorId}</span>
                    {' '}
                    {event.action.replaceAll('_', ' ').toLowerCase()}
                  </p>
                  <time className="shrink-0 text-xs text-slate-400">{formatTripTimestamp(event.createdAt, props.trip.timezone)}</time>
                </li>
              ))}
        </ol>
      </section>
    </div>
  );
}

function renderReadiness(props: ContentProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-[28px] bg-[#160E53] p-6 text-white">
        <p className="text-xs font-semibold tracking-[0.18em] text-white/55 uppercase">{TRIP_COPY.headings.readiness}</p>
        <p className="mt-4 font-[Outfit] text-6xl font-semibold">{new Intl.NumberFormat().format(props.data.readiness?.score ?? 0)}</p>
        <p className="mt-3 text-sm leading-6 text-white/65">{TRIP_COPY.readiness.description}</p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#f8d775]" style={{ width: `${props.data.readiness?.score ?? 0}%` }} /></div>
      </aside>
      <div className="space-y-5">
        <section className="rounded-[26px] border border-slate-200 bg-white p-5">
          <h2 className="font-[Outfit] text-lg font-semibold text-slate-950">{TRIP_COPY.sections.findings}</h2>
          <div className="mt-4 space-y-3">
            {props.data.findings.length === 0
              ? <p className="text-sm text-slate-500">{TRIP_COPY.empty.findings}</p>
              : props.data.findings.map(finding => (
                  <article className="rounded-2xl border border-slate-200 p-4" key={finding.id}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={finding.severity === 'CRITICAL' ? 'muted' : 'default'}>{TRIP_COPY.labels[finding.severity.toLowerCase() as 'critical' | 'info' | 'warning']}</Badge>
                      {finding.isBlocking ? <Badge variant="muted">{TRIP_COPY.labels.blocking}</Badge> : null}
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-slate-950">{TRIP_COPY.findingRules[finding.rule]}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{typeof finding.evidence.explanation === 'string' ? finding.evidence.explanation : null}</p>
                  </article>
                ))}
          </div>
        </section>
        <section className="rounded-[26px] border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 font-[Outfit] text-lg font-semibold text-slate-950">
            <Sparkles className="h-5 w-5 text-[#160E53]" />
            {TRIP_COPY.sections.proposals}
          </h2>
          <div className="mt-4 space-y-3">
            {props.data.proposals.length === 0
              ? <p className="text-sm text-slate-500">{TRIP_COPY.empty.proposals}</p>
              : props.data.proposals.map(proposal => (
                  <article className="rounded-2xl bg-slate-50 p-4" key={proposal.id}>
                    <p className="text-sm font-semibold text-slate-950">{proposal.rationale}</p>
                    <ul className="mt-3 space-y-2">
                      {proposal.operations.map((operation, index) => (
                        // eslint-disable-next-line react/no-array-index-key -- Operation indexes are immutable identifiers used by the proposal API.
                        <li className="flex gap-2 text-sm text-slate-600" key={`${operation.type}-${index}`}>
                          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#160E53]" />
                          {operation.expectedEffect}
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-4" disabled={props.trip.role === 'VIEWER' || props.actions.isPending} onClick={() => props.actions.applyProposal({ selectedOperationIndexes: proposal.operations.map((_, index) => index), proposalId: proposal.id })} size="sm">{TRIP_COPY.actions.applyProposal}</Button>
                  </article>
                ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function renderLive(props: ContentProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6">
        <h2 className="font-[Outfit] text-2xl font-semibold text-slate-950">{TRIP_COPY.headings.live}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{TRIP_COPY.live.description}</p>
        <div className="mt-6 space-y-3">
          {props.data.items.length === 0
            ? <p className="text-sm text-slate-500">{TRIP_COPY.empty.items}</p>
            : props.data.items.map(item => (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4" key={item.id}>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.startTime ?? TRIP_COPY.plan.unknownHours}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      disabled={props.trip.role === 'VIEWER' || props.actions.isPending}
                      onClick={() => props.actions.recordActual({ itemId: item.id, status: 'SKIPPED' })}
                      size="sm"
                      variant="outline"
                    >
                      {TRIP_COPY.actions.skip}
                    </Button>
                    <Button
                      disabled={props.trip.role === 'VIEWER' || props.actions.isPending}
                      onClick={() => props.actions.recordActual({ itemId: item.id, status: 'COMPLETED' })}
                      size="sm"
                    >
                      <Check className="h-4 w-4" />
                      {TRIP_COPY.actions.markComplete}
                    </Button>
                  </div>
                </div>
              ))}
        </div>
      </section>
      <aside className="rounded-[28px] border border-[#160E53]/15 bg-[#160E53]/4 p-6">
        <CloudDownload className="h-6 w-6 text-[#160E53]" />
        <h2 className="mt-4 font-[Outfit] text-lg font-semibold text-slate-950">{TRIP_COPY.sections.snapshot}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{props.data.offlineSnapshot ? TRIP_COPY.live.offlineAvailable : TRIP_COPY.errors.offline}</p>
        <Button className="mt-5" disabled={props.trip.role === 'VIEWER' || props.actions.isPending} onClick={() => props.actions.startLive()}>{TRIP_COPY.actions.startLive}</Button>
      </aside>
    </div>
  );
}

function renderPostTrip(props: ContentProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#160E53]/55 uppercase">{TRIP_COPY.headings.postTrip}</p>
        <h2 className="mt-3 font-[Outfit] text-2xl font-semibold text-slate-950">{TRIP_COPY.sections.privacyPreview}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{TRIP_COPY.postTrip.description}</p>
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          <ShieldCheck className="mr-2 inline h-4 w-4" />
          {TRIP_COPY.postTrip.privacyNote}
        </div>
        <Button className="mt-6" disabled={props.trip.role !== 'OWNER' || props.actions.isPending} onClick={() => props.actions.publishDraft()}>{TRIP_COPY.actions.publishDraft}</Button>
        {props.data.publishDraft
          ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2" aria-live="polite">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-950">{TRIP_COPY.sections.privacyPreview}</p>
                  <ul className="mt-3 space-y-1 text-xs text-emerald-900">
                    <li>{props.data.publishDraft.draft.title}</li>
                    {props.data.publishDraft.draft.days.flatMap(day => day.places.map(place => <li key={`${day.dayNumber}-${place.order}`}>{place.name}</li>))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-sm font-semibold text-slate-950">{TRIP_COPY.labels.private}</p>
                  <ul className="mt-3 space-y-1 text-xs text-slate-700">
                    {props.data.publishDraft.privacy.excludedFields.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
            )
          : null}
      </section>
      <aside className="rounded-[28px] bg-slate-950 p-6 text-white">
        <LockKeyhole className="h-6 w-6 text-[#f8d775]" />
        <h2 className="mt-5 font-[Outfit] text-lg font-semibold">{TRIP_COPY.labels.private}</h2>
        <p className="mt-2 text-sm leading-6 text-white/65">{TRIP_COPY.postTrip.privacyNote}</p>
      </aside>
    </div>
  );
}

function EmptyMessage(props: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#160E53]/8 text-[#160E53]">{props.icon}</span>
      <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">{props.message}</p>
    </div>
  );
}

export function TripWorkspaceContent(props: ContentProps) {
  const [planView, setPlanView] = useState<'board' | 'map' | 'timeline'>('timeline');

  if (props.tab === 'overview') {
    return renderOverview(props);
  }
  if (props.tab === 'inbox') {
    return renderInbox(props);
  }
  if (props.tab === 'plan') {
    return renderPlan(props, planView, setPlanView);
  }
  if (props.tab === 'collaboration') {
    return renderCollaboration(props);
  }
  if (props.tab === 'readiness') {
    return renderReadiness(props);
  }
  if (props.tab === 'live') {
    return renderLive(props);
  }
  return renderPostTrip(props);
}
