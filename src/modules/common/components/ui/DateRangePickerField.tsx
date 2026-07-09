'use client';

import { useId, useMemo, useState } from 'react';
import { CalendarIcon } from '@/modules/common/icons';
import { cn } from './cn';
import { formatDateLabel } from './date-time-picker.utils';
import { DateRangePickerModal } from './DateRangePickerModal';

export type DateRangePickerFieldProps = {
  allowClear?: boolean;
  className?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  onChange: (startDate: string, endDate: string) => void;
  placeholder?: string;
  title: string;
  startDate?: string;
  endDate?: string;
};

export function DateRangePickerField(props: DateRangePickerFieldProps) {
  const {
    allowClear = true,
    className,
    description,
    disabled,
    id,
    onChange,
    placeholder = 'Select date range',
    title,
    startDate,
    endDate,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  const displayValue = useMemo(() => {
    if (!startDate && !endDate) return '';
    const startLabel = startDate ? formatDateLabel(startDate) : '';
    const endLabel = endDate ? formatDateLabel(endDate) : '';
    if (startLabel && endLabel) {
      return `${startLabel} – ${endLabel}`;
    }
    return startLabel || endLabel;
  }, [startDate, endDate]);

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={cn(
          'flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm transition-colors',
          disabled
            ? 'cursor-not-allowed bg-slate-50 text-slate-400 opacity-70'
            : 'text-slate-900 hover:border-slate-300 hover:bg-slate-50',
          className,
        )}
        disabled={disabled}
        id={fieldId}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <span className={cn('truncate', displayValue ? 'text-slate-900' : 'text-slate-400')}>{displayValue || placeholder}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <CalendarIcon className="h-4 w-4" />
        </span>
      </button>

      {isOpen
        ? (
            <DateRangePickerModal
              allowClear={allowClear}
              description={description}
              key={`${startDate ?? ''}:${endDate ?? ''}`}
              onClose={() => setIsOpen(false)}
              onSelect={onChange}
              title={title}
              startDate={startDate}
              endDate={endDate}
            />
          )
        : null}
    </>
  );
}
