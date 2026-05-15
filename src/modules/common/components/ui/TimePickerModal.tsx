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
    <OverlayModal ariaLabel={title} className="date-time-picker-modal max-w-5xl overflow-hidden rounded-[32px]" onClose={onClose}>
      <div className="grid gap-0 md:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="date-time-picker-rail p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="date-time-picker-rail-icon flex h-12 w-12 items-center justify-center rounded-2xl backdrop-blur-sm">
              <ClockIcon className="h-5 w-5" />
            </div>
            <button
              aria-label="Close time picker"
              className="date-time-picker-close rounded-full p-2 transition-colors"
              onClick={onClose}
              type="button"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <p className="date-time-picker-rail-muted mt-8 text-xs font-semibold tracking-[0.22em] uppercase">Time picker</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="date-time-picker-rail-muted mt-3 text-sm leading-6">
            {description ?? 'Pick the exact time with an easier, more polished selection flow.'}
          </p>

          <div className="date-time-picker-selection-card mt-8 rounded-[28px] border p-5 backdrop-blur-sm">
            <p className="date-time-picker-rail-muted text-xs font-semibold tracking-[0.18em] uppercase">Selected</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{formatTimeLabel(previewValue)}</p>
            <p className="date-time-picker-rail-muted mt-2 text-sm">Adjust the hour and minute columns, then apply.</p>
          </div>
        </aside>

        <section className="date-time-picker-panel p-5 sm:p-6">
          <div className="date-time-picker-divider border-b pb-5">
            <p className="date-time-picker-overline text-xs font-semibold tracking-[0.18em] uppercase">Quick picks</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_TIME_PRESETS.map(preset => (
                <button
                  className={cn(
                    'date-time-picker-option rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                    previewValue === preset.value && 'date-time-picker-option-selected',
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
            <div className="date-time-picker-subpanel rounded-[28px] border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="date-time-picker-overline text-xs font-semibold tracking-[0.18em] uppercase">Hour</p>
                  <h3 className="date-time-picker-heading mt-1 text-xl font-semibold">{formatHourLabel(draftTime.hour)}</h3>
                </div>
                <div className="date-time-picker-pill rounded-full px-3 py-1 text-xs font-medium shadow-sm">
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
                        'date-time-picker-option rounded-2xl border px-4 py-3 text-left transition-colors',
                        isSelected && 'date-time-picker-option-selected',
                      )}
                      key={hour}
                      onClick={() => setDraftTime(current => ({ ...current, hour }))}
                      type="button"
                    >
                      <span className="block text-sm font-semibold">{String(hour).padStart(2, '0')}</span>
                      <span className="date-time-picker-option-muted mt-1 block text-xs">
                        {formatHourLabel(hour)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="date-time-picker-subpanel rounded-[28px] border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="date-time-picker-overline text-xs font-semibold tracking-[0.18em] uppercase">Minute</p>
                  <h3 className="date-time-picker-heading mt-1 text-xl font-semibold">{String(draftTime.minute).padStart(2, '0')}</h3>
                </div>
                <div className="date-time-picker-pill rounded-full px-3 py-1 text-xs font-medium shadow-sm">
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
                        'date-time-picker-option rounded-2xl border px-3 py-3 text-left transition-colors',
                        isSelected && 'date-time-picker-option-selected',
                      )}
                      key={minute}
                      onClick={() => setDraftTime(current => ({ ...current, minute }))}
                      type="button"
                    >
                      <span className="block text-sm font-semibold">{String(minute).padStart(2, '0')}</span>
                      <span className="date-time-picker-option-muted mt-1 block text-[11px]">
                        {formatMinuteLabel(minute)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="date-time-picker-divider mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {allowClear
                ? (
                    <button
                      className="date-time-picker-action-button inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
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
                className="date-time-picker-action-button rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
              <button
                className="date-time-picker-primary-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
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
