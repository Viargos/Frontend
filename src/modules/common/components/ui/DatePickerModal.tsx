'use client';

import { useMemo, useState } from 'react';
import {
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
} from '@/modules/common/icons';
import { OverlayModal } from '../OverlayModal';
import { cn } from './cn';
import {
  addMonths,
  formatDateLabel,
  formatMonthLabel,
  getCalendarDays,
  getInitialMonth,
  getTodayDateValue,
  isDateDisabled,
  parseDateValue,
} from './date-time-picker.utils';

type DatePickerModalProps = {
  allowClear?: boolean;
  description?: string;
  max?: string;
  min?: string;
  onClose: () => void;
  onSelect: (value: string) => void;
  title: string;
  value?: string;
};

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function DatePickerModal(props: DatePickerModalProps) {
  const {
    allowClear = true,
    description,
    max,
    min,
    onClose,
    onSelect,
    title,
    value,
  } = props;
  const todayValue = getTodayDateValue();
  const [draftValue, setDraftValue] = useState(value ?? '');
  const [viewDate, setViewDate] = useState(() => getInitialMonth(value, todayValue));

  const calendarDays = useMemo(() => getCalendarDays(viewDate), [viewDate]);
  const isTodayDisabled = isDateDisabled(parseDateValue(todayValue) ?? new Date(), min, max);

  return (
    <OverlayModal ariaLabel={title} className="max-w-4xl overflow-hidden rounded-[32px]" onClose={onClose}>
      <div className="grid gap-0 md:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="bg-linear-to-br from-[#160E53] via-[#1D1466] to-[#2B1D80] p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-white backdrop-blur-sm">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <button
              aria-label="Close date picker"
              className="rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              onClick={onClose}
              type="button"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-8 text-xs font-semibold tracking-[0.22em] text-white/60 uppercase">Date picker</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-white/72">
            {description ?? 'Choose a date with a cleaner, more deliberate planning flow.'}
          </p>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/60 uppercase">Selected</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {draftValue ? formatDateLabel(draftValue) : 'No date selected'}
            </p>
            <p className="mt-2 text-sm text-white/65">
              {draftValue
                ? 'Review it before applying.'
                : 'Pick a date from the calendar on the right.'}
            </p>
          </div>
        </aside>

        <section className="bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">Calendar view</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {formatMonthLabel(viewDate)}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label="Previous month"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
                onClick={() => setViewDate(previous => addMonths(previous, -1))}
                type="button"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                aria-label="Next month"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
                onClick={() => setViewDate(previous => addMonths(previous, 1))}
                type="button"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2">
            {WEEKDAY_LABELS.map(label => (
              <div className="px-1 py-2 text-center text-xs font-semibold tracking-wide text-slate-400 uppercase" key={label}>
                {label}
              </div>
            ))}

            {calendarDays.map((day) => {
              const isDisabled = isDateDisabled(day.date, min, max);
              const isSelected = draftValue === day.isoValue;

              return (
                <button
                  aria-pressed={isSelected}
                  className={cn(
                    'group relative min-h-[76px] rounded-3xl border px-3 py-3 text-left transition-all',
                    isSelected
                      ? 'border-[#160E53] bg-[#160E53] text-white shadow-lg shadow-[#160E53]/18'
                      : day.isCurrentMonth
                        ? 'border-slate-200 bg-white text-slate-900 hover:border-[#160E53]/25 hover:bg-slate-50'
                        : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:bg-white',
                    isDisabled && 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 opacity-70 hover:border-slate-100 hover:bg-slate-50',
                  )}
                  disabled={isDisabled}
                  key={day.isoValue}
                  onClick={() => setDraftValue(day.isoValue)}
                  type="button"
                >
                  <span className="text-sm font-semibold">{day.date.getDate()}</span>
                  {day.isToday
                    ? (
                        <span className={cn(
                          'mt-3 inline-flex rounded-full px-2 py-1 text-[11px] font-medium',
                          isSelected ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600',
                        )}
                        >
                          Today
                        </span>
                      )
                    : null}
                  {isSelected
                    ? (
                        <span className="absolute right-3 bottom-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/14 text-white">
                          <CheckIcon className="h-4 w-4" />
                        </span>
                      )
                    : null}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isTodayDisabled}
                onClick={() => {
                  setDraftValue(todayValue);
                  setViewDate(getInitialMonth(todayValue, todayValue));
                }}
                type="button"
              >
                <CalendarIcon className="h-4 w-4" />
                Today
              </button>
              {allowClear
                ? (
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                      onClick={() => setDraftValue('')}
                      type="button"
                    >
                      <XIcon className="h-4 w-4" />
                      Clear
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
                className="rounded-full bg-[#160E53] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#241A7A]"
                onClick={() => {
                  onSelect(draftValue);
                  onClose();
                }}
                type="button"
              >
                Apply date
              </button>
            </div>
          </div>
        </section>
      </div>
    </OverlayModal>
  );
}
