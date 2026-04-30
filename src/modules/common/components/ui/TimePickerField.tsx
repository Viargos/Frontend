'use client';

import { useId, useState } from 'react';
import { ClockIcon } from '@/modules/common/icons';
import { cn } from './cn';
import { formatTimeLabel } from './date-time-picker.utils';
import { TimePickerModal } from './TimePickerModal';

export type TimePickerFieldProps = {
  allowClear?: boolean;
  className?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  title: string;
  value?: string;
};

export function TimePickerField(props: TimePickerFieldProps) {
  const {
    allowClear = true,
    className,
    description,
    disabled,
    id,
    onChange,
    placeholder = 'Select time',
    title,
    value,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const displayValue = formatTimeLabel(value);

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
          <ClockIcon className="h-4 w-4" />
        </span>
      </button>

      {isOpen
        ? (
            <TimePickerModal
              allowClear={allowClear}
              description={description}
              key={value ?? ''}
              onClose={() => setIsOpen(false)}
              onSelect={onChange}
              title={title}
              value={value}
            />
          )
        : null}
    </>
  );
}
