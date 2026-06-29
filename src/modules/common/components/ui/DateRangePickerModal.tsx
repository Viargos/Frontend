'use client';

import { useMemo, useState } from 'react';
import { CalendarIcon, CheckIcon, XIcon } from '@/modules/common/icons';
import { OverlayModal } from '../OverlayModal';
import { Calendar } from 'primereact/calendar';
import {
  formatDateLabel,
  formatDateValue,
  getTodayDateValue,
  parseDateValue,
} from './date-time-picker.utils';

type DateRangePickerModalProps = {
  allowClear?: boolean;
  description?: string;
  onClose: () => void;
  onSelect: (startDate: string, endDate: string) => void;
  title: string;
  startDate?: string;
  endDate?: string;
};

export function DateRangePickerModal(props: DateRangePickerModalProps) {
  const { allowClear = true, description, onClose, onSelect, title, startDate = '', endDate = '' } = props;
  const todayValue = getTodayDateValue();
  const [draftStartDate, setDraftStartDate] = useState(startDate);
  const [draftEndDate, setDraftEndDate] = useState(endDate);

  const draftDates = useMemo(() => {
    const dates: (Date | null)[] = [];
    if (draftStartDate) {
      const parsedStart = parseDateValue(draftStartDate);
      dates.push(parsedStart);
    } else {
      dates.push(null);
    }
    if (draftEndDate) {
      const parsedEnd = parseDateValue(draftEndDate);
      dates.push(parsedEnd);
    } else {
      dates.push(null);
    }
    return dates;
  }, [draftStartDate, draftEndDate]);

  const isStartOrEndDate = (d: { day: number; month: number; year: number }) => {
    if (draftStartDate) {
      const parsedStart = parseDateValue(draftStartDate);
      if (parsedStart && parsedStart.getDate() === d.day && parsedStart.getMonth() === d.month && parsedStart.getFullYear() === d.year) {
        return 'start';
      }
    }
    if (draftEndDate) {
      const parsedEnd = parseDateValue(draftEndDate);
      if (parsedEnd && parsedEnd.getDate() === d.day && parsedEnd.getMonth() === d.month && parsedEnd.getFullYear() === d.year) {
        return 'end';
      }
    }
    return null;
  };

  const dateTemplate = (dateMeta: any) => {
    const startOrEnd = isStartOrEndDate(dateMeta);

    return (
      <div className="relative flex flex-col items-start justify-between w-full h-full p-3 text-left">
        <span className="text-sm font-semibold">{dateMeta.day}</span>
        {startOrEnd && (
          <span className="date-time-picker-selected-mark absolute right-3 bottom-3 inline-flex h-7 w-7 items-center justify-center rounded-full">
            <CheckIcon className="h-4 w-4" />
          </span>
        )}
      </div>
    );
  };

  const formatDisplayRange = (start?: string, end?: string): string => {
    if (!start && !end) return 'No range selected';
    const startLabel = start ? formatDateLabel(start) : 'Select start date';
    const endLabel = end ? formatDateLabel(end) : 'Select end date';
    return `${startLabel} – ${endLabel}`;
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
            Date range picker
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="date-time-picker-rail-muted mt-3 text-sm leading-6">
            {description ?? 'Choose a start date and an end date for your journey.'}
          </p>

          <div className="date-time-picker-selection-card mt-8 rounded-[28px] border p-5 backdrop-blur-sm">
            <p className="date-time-picker-rail-muted text-xs font-semibold tracking-[0.18em] uppercase">
              Selected Range
            </p>
            <p className="mt-3 text-xl font-semibold tracking-tight leading-7">
              {formatDisplayRange(draftStartDate, draftEndDate)}
            </p>
            <p className="date-time-picker-rail-muted mt-2 text-sm">
              {draftStartDate && draftEndDate
                ? 'Review range before applying.'
                : 'Pick start and end dates from the calendar.'}
            </p>
          </div>
        </aside>

        <section className="date-time-picker-panel p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex-1">
            <Calendar
              value={draftDates}
              onChange={(e) => {
                const vals = e.value as (Date | null)[] | null;
                if (!vals || vals.length === 0) {
                  setDraftStartDate('');
                  setDraftEndDate('');
                } else {
                  const start = vals[0] ? formatDateValue(vals[0]) : '';
                  const end = vals[1] ? formatDateValue(vals[1]) : '';
                  setDraftStartDate(start);
                  setDraftEndDate(end);
                }
              }}
              inline
              selectionMode="range"
              dateTemplate={dateTemplate}
            />
          </div>

          <div className="date-time-picker-divider mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                className="date-time-picker-action-button inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                onClick={() => {
                  setDraftStartDate(todayValue);
                  setDraftEndDate(todayValue);
                }}
                type="button"
              >
                <CalendarIcon className="h-4 w-4" />
                Today
              </button>
              {allowClear ? (
                <button
                  className="date-time-picker-action-button inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                  onClick={() => {
                    setDraftStartDate('');
                    setDraftEndDate('');
                  }}
                  type="button"
                >
                  <XIcon className="h-4 w-4" />
                  Clear
                </button>
              ) : null}
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
                className="date-time-picker-primary-button rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!draftStartDate || !draftEndDate}
                onClick={() => {
                  onSelect(draftStartDate, draftEndDate);
                  onClose();
                }}
                type="button"
              >
                Apply date range
              </button>
            </div>
          </div>
        </section>
      </div>
    </OverlayModal>
  );
}
