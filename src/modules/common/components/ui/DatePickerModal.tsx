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
    <OverlayModal ariaLabel={title} className="date-time-picker-modal max-w-4xl overflow-hidden rounded-[32px]" onClose={onClose}>
      <div className="grid gap-0 md:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="date-time-picker-rail p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="date-time-picker-rail-icon flex h-12 w-12 items-center justify-center rounded-2xl backdrop-blur-sm">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <button
              aria-label="Close date picker"
              className="date-time-picker-close rounded-full p-2 transition-colors"
              onClick={onClose}
              type="button"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <p className="date-time-picker-rail-muted mt-8 text-xs font-semibold tracking-[0.22em] uppercase">Date picker</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="date-time-picker-rail-muted mt-3 text-sm leading-6">
            {description ?? 'Choose a date with a cleaner, more deliberate planning flow.'}
          </p>

          <div className="date-time-picker-selection-card mt-8 rounded-[28px] border p-5 backdrop-blur-sm">
            <p className="date-time-picker-rail-muted text-xs font-semibold tracking-[0.18em] uppercase">Selected</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {draftValue ? formatDateLabel(draftValue) : 'No date selected'}
            </p>
            <p className="date-time-picker-rail-muted mt-2 text-sm">
              {draftValue
                ? 'Review it before applying.'
                : 'Pick a date from the calendar on the right.'}
            </p>
          </div>
        </aside>

        <section className="date-time-picker-panel p-5 sm:p-6">
          <div className="date-time-picker-divider flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="date-time-picker-overline text-xs font-semibold tracking-[0.18em] uppercase">Calendar view</p>
              <h3 className="date-time-picker-heading mt-2 text-2xl font-semibold tracking-tight">
                {formatMonthLabel(viewDate)}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label="Previous month"
                className="date-time-picker-nav-button flex h-10 w-10 items-center justify-center rounded-2xl border transition-colors"
                onClick={() => setViewDate(previous => addMonths(previous, -1))}
                type="button"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                aria-label="Next month"
                className="date-time-picker-nav-button flex h-10 w-10 items-center justify-center rounded-2xl border transition-colors"
                onClick={() => setViewDate(previous => addMonths(previous, 1))}
                type="button"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2">
            {WEEKDAY_LABELS.map(label => (
              <div className="date-time-picker-overline px-1 py-2 text-center text-xs font-semibold tracking-wide uppercase" key={label}>
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
                    'date-time-picker-day',
                    day.isCurrentMonth ? 'date-time-picker-day-current' : 'date-time-picker-day-outside',
                    isSelected && 'date-time-picker-day-selected',
                    isDisabled && 'date-time-picker-day-disabled cursor-not-allowed',
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
                          isSelected ? 'date-time-picker-today-badge-selected' : 'date-time-picker-today-badge',
                        )}
                        >
                          Today
                        </span>
                      )
                    : null}
                  {isSelected
                    ? (
                        <span className="date-time-picker-selected-mark absolute right-3 bottom-3 inline-flex h-7 w-7 items-center justify-center rounded-full">
                          <CheckIcon className="h-4 w-4" />
                        </span>
                      )
                    : null}
                </button>
              );
            })}
          </div>

          <div className="date-time-picker-divider mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                className="date-time-picker-action-button inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="date-time-picker-action-button inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
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
                className="date-time-picker-action-button rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
              <button
                className="date-time-picker-primary-button rounded-full px-4 py-2 text-sm font-medium transition-colors"
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
