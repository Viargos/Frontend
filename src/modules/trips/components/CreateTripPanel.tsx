'use client';

import type { CreateTripInput, Trip } from '@/modules/trips/types/trip.types';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { Button, DateRangePickerField, Input, Label } from '@/modules/common/components/ui';
import { TRIP_COPY } from '@/modules/trips/copy/trip.copy';
import { createTripSchema } from '@/modules/trips/validations/trip.validation';

const defaultInput: CreateTripInput = {
  currency: 'CAD',
  flexibleDates: false,
  pace: 'BALANCED',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  title: '',
  transportMode: 'TRANSIT',
  travellerCount: 1,
};

export function CreateTripPanel(props: {
  isCreating: boolean;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateTripInput) => Promise<Trip>;
}) {
  const [input, setInput] = useState<CreateTripInput>(defaultInput);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!props.isOpen) {
    return null;
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = createTripSchema.safeParse(input);

    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map(issue => [String(issue.path[0]), issue.message])));
      return;
    }

    await props.onCreate(result.data);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-[2px]" role="presentation">
      <button aria-label={TRIP_COPY.actions.close} className="absolute inset-0 cursor-default" onClick={props.onClose} type="button" />
      <section
        aria-labelledby="create-trip-title"
        aria-modal="true"
        className="relative h-full w-full max-w-xl overflow-y-auto border-l border-white/15 bg-[#f8fafc] shadow-2xl"
        role="dialog"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-[#160E53]/60 uppercase">{TRIP_COPY.headings.trips}</p>
            <h2 className="mt-1 font-[Outfit] text-2xl font-semibold text-slate-950" id="create-trip-title">{TRIP_COPY.actions.create}</h2>
          </div>
          <Button aria-label={TRIP_COPY.actions.close} className="h-10 w-10 rounded-full p-0" onClick={props.onClose} variant="ghost">
            <X aria-hidden className="h-5 w-5" />
          </Button>
        </div>

        <form className="space-y-6 p-5 sm:p-8" onSubmit={submit}>
          <div>
            <Label htmlFor="trip-title">{TRIP_COPY.create.title}</Label>
            <Input
              aria-invalid={Boolean(errors.title)}
              className="mt-2 h-12 rounded-2xl"
              id="trip-title"
              onChange={event => setInput(current => ({ ...current, title: event.target.value }))}
              placeholder={TRIP_COPY.create.titlePlaceholder}
              value={input.title}
            />
            {errors.title ? <p className="mt-2 text-xs text-red-700">{errors.title}</p> : null}
          </div>

          <div>
            <Label htmlFor="trip-description">{TRIP_COPY.create.description}</Label>
            <textarea
              className="mt-2 min-h-28 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus-visible:border-[#160E53] focus-visible:ring-2 focus-visible:ring-[#160E53]/15"
              id="trip-description"
              onChange={event => setInput(current => ({ ...current, description: event.target.value }))}
              placeholder={TRIP_COPY.create.descriptionPlaceholder}
              value={input.description ?? ''}
            />
          </div>

          <div>
            <Label>{TRIP_COPY.create.dates}</Label>
            <DateRangePickerField
              className="mt-2"
              endDate={input.endDate}
              onChange={(startDate, endDate) => setInput(current => ({ ...current, endDate, startDate }))}
              startDate={input.startDate}
              title={TRIP_COPY.create.dates}
            />
            <label className="mt-3 flex items-center gap-3 text-sm text-slate-700">
              <input
                checked={input.flexibleDates}
                className="h-4 w-4 rounded border-slate-300 accent-[#160E53]"
                onChange={event => setInput(current => ({ ...current, flexibleDates: event.target.checked }))}
                type="checkbox"
              />
              {TRIP_COPY.create.flexibleDates}
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="trip-timezone">{TRIP_COPY.create.timezone}</Label>
              <Input
                className="mt-2 h-12 rounded-2xl"
                id="trip-timezone"
                onChange={event => setInput(current => ({ ...current, timezone: event.target.value }))}
                value={input.timezone}
              />
            </div>
            <div>
              <Label htmlFor="trip-currency">{TRIP_COPY.create.currency}</Label>
              <Input
                className="mt-2 h-12 rounded-2xl uppercase"
                id="trip-currency"
                maxLength={3}
                onChange={event => setInput(current => ({ ...current, currency: event.target.value.toUpperCase() }))}
                value={input.currency}
              />
            </div>
            <div>
              <Label htmlFor="trip-travellers">{TRIP_COPY.create.travellers}</Label>
              <Input
                className="mt-2 h-12 rounded-2xl"
                id="trip-travellers"
                max={100}
                min={1}
                onChange={event => setInput(current => ({ ...current, travellerCount: event.target.valueAsNumber }))}
                type="number"
                value={input.travellerCount}
              />
            </div>
            <div>
              <Label htmlFor="trip-pace">{TRIP_COPY.create.pace}</Label>
              <select
                className="mt-2 h-12 w-full rounded-2xl border border-slate-300 bg-white px-3 text-sm"
                id="trip-pace"
                onChange={event => setInput(current => ({ ...current, pace: event.target.value as CreateTripInput['pace'] }))}
                value={input.pace}
              >
                <option value="RELAXED">{TRIP_COPY.labels.slow}</option>
                <option value="BALANCED">{TRIP_COPY.labels.balanced}</option>
                <option value="FAST">{TRIP_COPY.labels.fast}</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="trip-transport">{TRIP_COPY.create.transport}</Label>
            <select
              className="mt-2 h-12 w-full rounded-2xl border border-slate-300 bg-white px-3 text-sm"
              id="trip-transport"
              onChange={event => setInput(current => ({ ...current, transportMode: event.target.value as CreateTripInput['transportMode'] }))}
              value={input.transportMode}
            >
              <option value="TRANSIT">{TRIP_COPY.labels.publicTransit}</option>
              <option value="WALK">{TRIP_COPY.labels.walk}</option>
              <option value="DRIVE">{TRIP_COPY.labels.car}</option>
              <option value="BICYCLE">{TRIP_COPY.labels.bicycle}</option>
            </select>
          </div>

          <Button className="h-12 w-full rounded-2xl bg-[#160E53] text-white hover:bg-[#241a7a]" disabled={props.isCreating} type="submit">
            <Check aria-hidden className="mr-2 h-4 w-4" />
            {TRIP_COPY.actions.create}
          </Button>
        </form>
      </section>
    </div>
  );
}
