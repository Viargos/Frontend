'use client';

import { useMemo, useState } from 'react';
import { CheckIcon, ClockIcon, XIcon } from '@/modules/common/icons';
import { OverlayModal } from '../OverlayModal';
import { cn } from './cn';
import {
  formatTimeLabel,
  formatTimeValue,
  getDefaultTimeParts,
  getTimeColumns,
} from './date-time-picker.utils';

type TimePickerModalProps = {
  allowClear?: boolean;
  description?: string;
  onClose: () => void;
  onSelect: (value: string) => void;
  title: string;
  value?: string;
};

const QUICK_TIME_PRESETS = [
  { label: 'Sunrise', value: '06:30' },
  { label: 'Morning', value: '09:00' },
  { label: 'Noon', value: '12:00' },
  { label: 'Afternoon', value: '15:30' },
  { label: 'Dinner', value: '19:00' },
  { label: 'Night', value: '21:30' },
] as const;

function formatHourLabel(hour: number): string {
  const displayHour = hour % 12 || 12;
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  return `${displayHour} ${meridiem}`;
}

function formatMinuteLabel(minute: number): string {
  return `${String(minute).padStart(2, '0')} min`;
}

export function TimePickerModal(props: TimePickerModalProps) {
  const {
    allowClear = true,
    description,
    onClose,
    onSelect,
    title,
    value,
  } = props;
  const [draftTime, setDraftTime] = useState(() => getDefaultTimeParts(value));
  const { hours, minutes } = useMemo(() => getTimeColumns(), []);
  const previewValue = formatTimeValue(draftTime.hour, draftTime.minute);

  return (
    <OverlayModal ariaLabel={title} className="max-w-5xl overflow-hidden rounded-[32px]" onClose={onClose}>
      <div className="grid gap-0 md:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="bg-linear-to-br from-slate-950 via-slate-900 to-[#160E53] p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-white backdrop-blur-sm">
              <ClockIcon className="h-5 w-5" />
            </div>
            <button
              aria-label="Close time picker"
              className="rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              onClick={onClose}
              type="button"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-8 text-xs font-semibold tracking-[0.22em] text-white/60 uppercase">Time picker</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-white/72">
            {description ?? 'Pick the exact time with an easier, more polished selection flow.'}
          </p>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/60 uppercase">Selected</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{formatTimeLabel(previewValue)}</p>
            <p className="mt-2 text-sm text-white/65">Adjust the hour and minute columns, then apply.</p>
          </div>
        </aside>

        <section className="bg-white p-5 sm:p-6">
          <div className="border-b border-slate-200 pb-5">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">Quick picks</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_TIME_PRESETS.map(preset => (
                <button
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                    previewValue === preset.value
                      ? 'border-[#160E53] bg-[#160E53] text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                  )}
                  key={preset.value}
                  onClick={() => {
                    const nextParts = preset.value.split(':');
                    const hour = Number(nextParts[0] ?? 0);
                    const minute = Number(nextParts[1] ?? 0);
                    setDraftTime({ hour, minute });
                  }}
                  type="button"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">Hour</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">{formatHourLabel(draftTime.hour)}</h3>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                  24-hour
                </div>
              </div>

              <div className="scrollbar-hide mt-4 grid max-h-[340px] grid-cols-2 gap-2 overflow-y-auto pr-1">
                {hours.map((hour) => {
                  const isSelected = draftTime.hour === hour;

                  return (
                    <button
                      aria-pressed={isSelected}
                      className={cn(
                        'rounded-2xl border px-4 py-3 text-left transition-colors',
                        isSelected
                          ? 'border-[#160E53] bg-[#160E53] text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100',
                      )}
                      key={hour}
                      onClick={() => setDraftTime(current => ({ ...current, hour }))}
                      type="button"
                    >
                      <span className="block text-sm font-semibold">{String(hour).padStart(2, '0')}</span>
                      <span className={cn('mt-1 block text-xs', isSelected ? 'text-white/72' : 'text-slate-400')}>
                        {formatHourLabel(hour)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">Minute</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">{String(draftTime.minute).padStart(2, '0')}</h3>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                  precise
                </div>
              </div>

              <div className="scrollbar-hide mt-4 grid max-h-[340px] grid-cols-3 gap-2 overflow-y-auto pr-1">
                {minutes.map((minute) => {
                  const isSelected = draftTime.minute === minute;

                  return (
                    <button
                      aria-pressed={isSelected}
                      className={cn(
                        'rounded-2xl border px-3 py-3 text-left transition-colors',
                        isSelected
                          ? 'border-[#160E53] bg-[#160E53] text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100',
                      )}
                      key={minute}
                      onClick={() => setDraftTime(current => ({ ...current, minute }))}
                      type="button"
                    >
                      <span className="block text-sm font-semibold">{String(minute).padStart(2, '0')}</span>
                      <span className={cn('mt-1 block text-[11px]', isSelected ? 'text-white/72' : 'text-slate-400')}>
                        {formatMinuteLabel(minute)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {allowClear
                ? (
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                      onClick={() => {
                        onSelect('');
                        onClose();
                      }}
                      type="button"
                    >
                      <XIcon className="h-4 w-4" />
                      Clear time
                    </button>
                  )
                : null}
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-[#160E53] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#241A7A]"
                onClick={() => {
                  onSelect(previewValue);
                  onClose();
                }}
                type="button"
              >
                <CheckIcon className="h-4 w-4" />
                Apply time
              </button>
            </div>
          </div>
        </section>
      </div>
    </OverlayModal>
  );
}
