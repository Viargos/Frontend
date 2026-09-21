'use client';

import type { CalendarProps } from 'primereact/calendar';
import { Calendar } from 'primereact/calendar';
import { useMemo, useState } from 'react';
import { CalendarIcon, CheckIcon, XIcon } from '@/modules/common/icons';
import { OverlayModal } from '../OverlayModal';
import {
  formatDateLabel,
  formatDateValue,
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

export function DatePickerModal(props: DatePickerModalProps) {
  const { allowClear = true, description, max, min, onClose, onSelect, title, value } = props;
  const todayValue = getTodayDateValue();
  const [draftValue, setDraftValue] = useState(value ?? '');

  const isTodayDisabled = isDateDisabled(parseDateValue(todayValue) ?? new Date(), min, max);

  const minDate = useMemo(() => (min ? (parseDateValue(min) ?? undefined) : undefined), [min]);
  const maxDate = useMemo(() => (max ? (parseDateValue(max) ?? undefined) : undefined), [max]);
  const draftDate = useMemo(() => parseDateValue(draftValue), [draftValue]);

  const isDateSelected = (d: { day: number; month: number; year: number }) => {
    if (!draftValue) {
      return false;
    }
    const parsed = parseDateValue(draftValue);
    if (!parsed) {
      return false;
    }
    return (
      parsed.getDate() === d.day
      && parsed.getMonth() === d.month
      && parsed.getFullYear() === d.year
    );
  };

  const dateTemplate = (
    dateMeta: Parameters<NonNullable<CalendarProps['dateTemplate']>>[0],
  ) => {
    const isSelected = isDateSelected(dateMeta);

    return (
      <div className="relative flex h-full w-full flex-col items-start justify-between p-3 text-left">
        <span className="text-sm font-semibold">{dateMeta.day}</span>
        {/* {dateMeta.today && (
          <span
            className={cn(
              'mt-3 inline-flex rounded-full px-2 py-1 text-[11px] font-medium transition-colors',
              isSelected ? 'date-time-picker-today-badge-selected' : 'date-time-picker-today-badge'
            )}
          >
            Today
          </span>
        )} */}
        {isSelected && (
          <span className="date-time-picker-selected-mark absolute right-3 bottom-3 inline-flex h-7 w-7 items-center justify-center rounded-full">
            <CheckIcon className="h-4 w-4" />
          </span>
        )}
      </div>
    );
  };

  return (
    <OverlayModal
      ariaLabel={title}
      className="date-time-picker-modal max-w-4xl overflow-hidden rounded-[32px]"
      onClose={onClose}
    >
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

          <p className="date-time-picker-rail-muted mt-8 text-xs font-semibold tracking-[0.22em] uppercase">
            Date picker
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="date-time-picker-rail-muted mt-3 text-sm leading-6">
            {description ?? 'Choose a date with a cleaner, more deliberate planning flow.'}
          </p>

          <div className="date-time-picker-selection-card mt-8 rounded-[28px] border p-5 backdrop-blur-sm">
            <p className="date-time-picker-rail-muted text-xs font-semibold tracking-[0.18em] uppercase">
              Selected
            </p>
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

        <section className="date-time-picker-panel flex flex-col justify-between p-5 sm:p-6">
          <div className="flex-1">
            <Calendar
              value={draftDate}
              onChange={(e) => {
                const val = e.value as Date | null;
                setDraftValue(val ? formatDateValue(val) : '');
              }}
              inline
              minDate={minDate}
              maxDate={maxDate}
              dateTemplate={dateTemplate}
            />
          </div>

          <div className="date-time-picker-divider mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                className="date-time-picker-action-button inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isTodayDisabled}
                onClick={() => {
                  setDraftValue(todayValue);
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
