'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ClockIcon } from '@/modules/common/icons';
import { cn } from './cn';
import { formatTimeLabel, formatTimeValue } from './date-time-picker.utils';

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
  minTime?: string;
};

function parseTypedTime(text: string): { hour: number; minute: number } | null {
  const clean = text.trim().toLowerCase().replace(/[.,]/g, ':').replace(/\s+/g, ' ');
  if (!clean) {
    return null;
  }

  // 1. HH:mm or HH:mm:ss (24h or simple 12h without am/pm)
  const hhmmMatch = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (hhmmMatch && hhmmMatch[1] && hhmmMatch[2]) {
    const h = Number.parseInt(hhmmMatch[1], 10);
    const m = Number.parseInt(hhmmMatch[2], 10);
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return { hour: h, minute: m };
    }
  }

  // 2. HH:mm am/pm (12h with AM/PM)
  const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
  if (ampmMatch && ampmMatch[1] && ampmMatch[2] && ampmMatch[3]) {
    let h = Number.parseInt(ampmMatch[1], 10);
    const m = Number.parseInt(ampmMatch[2], 10);
    const isPm = ampmMatch[3] === 'pm';
    if (h >= 1 && h <= 12 && m >= 0 && m < 60) {
      if (isPm && h < 12) {
        h += 12;
      }
      if (!isPm && h === 12) {
        h = 0;
      }
      return { hour: h, minute: m };
    }
  }

  // 3. HHMM am/pm (12h with AM/PM and no colon, e.g. 1030pm, 930am)
  const ampmNoDelimMatch = clean.match(/^(\d{3,4})\s*(am|pm)$/);
  if (ampmNoDelimMatch && ampmNoDelimMatch[1] && ampmNoDelimMatch[2]) {
    const val = ampmNoDelimMatch[1];
    const isPm = ampmNoDelimMatch[2] === 'pm';
    let h = Number.parseInt(val.slice(0, -2), 10);
    const m = Number.parseInt(val.slice(-2), 10);
    if (h >= 1 && h <= 12 && m >= 0 && m < 60) {
      if (isPm && h < 12) {
        h += 12;
      }
      if (!isPm && h === 12) {
        h = 0;
      }
      return { hour: h, minute: m };
    }
  }

  // 4. HHMM (24h or 12h without am/pm and no colon, e.g. 1030, 2215)
  const hhmmNoDelimMatch = clean.match(/^(\d{3,4})$/);
  if (hhmmNoDelimMatch && hhmmNoDelimMatch[1]) {
    const val = hhmmNoDelimMatch[1];
    const h = Number.parseInt(val.slice(0, -2), 10);
    const m = Number.parseInt(val.slice(-2), 10);
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return { hour: h, minute: m };
    }
  }

  // 5. H am/pm (e.g. 9pm, 12am, 9 am)
  const singleAmPmMatch = clean.match(/^(\d{1,2})\s*(am|pm)$/);
  if (singleAmPmMatch && singleAmPmMatch[1] && singleAmPmMatch[2]) {
    let h = Number.parseInt(singleAmPmMatch[1], 10);
    const isPm = singleAmPmMatch[2] === 'pm';
    if (h >= 1 && h <= 12) {
      if (isPm && h < 12) {
        h += 12;
      }
      if (!isPm && h === 12) {
        h = 0;
      }
      return { hour: h, minute: 0 };
    }
  }

  // 6. H or HH (e.g. 9, 14, 22) -> assume :00
  const singleNumMatch = clean.match(/^(\d{1,2})$/);
  if (singleNumMatch && singleNumMatch[1]) {
    const h = Number.parseInt(singleNumMatch[1], 10);
    if (h >= 0 && h < 24) {
      return { hour: h, minute: 0 };
    }
  }

  return null;
}

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
    minTime,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  const [inputValue, setInputValue] = useState(() => (value ? formatTimeLabel(value) : ''));
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state during rendering if external value changes
  if (value !== prevValue) {
    setPrevValue(value);
    setInputValue(value ? formatTimeLabel(value) : '');
  }

  // Clear value if minTime changes and current value is before minTime
  useEffect(() => {
    if (minTime && value && value < minTime) {
      onChange('');
    }
  }, [minTime, value, onChange]);

  // Generate dropdown options in 15-minute intervals
  const options = useMemo(() => {
    const opts = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const val = formatTimeValue(h, m);
        opts.push({
          label: formatTimeLabel(val),
          value: val,
        });
      }
    }
    return opts;
  }, []);

  // Handle click outside to close dropdown and commit any custom typed values
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        const parsed = parseTypedTime(inputValue);
        if (parsed) {
          const formattedVal = formatTimeValue(parsed.hour, parsed.minute);
          if (minTime && formattedVal < minTime) {
            setInputValue(value ? formatTimeLabel(value) : '');
          } else if (formattedVal !== value) {
            onChange(formattedVal);
          } else {
            setInputValue(formatTimeLabel(formattedVal));
          }
        } else {
          if (!inputValue.trim() && allowClear) {
            onChange('');
          } else {
            setInputValue(value ? formatTimeLabel(value) : '');
          }
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [inputValue, value, onChange, allowClear, minTime]);

  // Scroll current selected value into view when opening
  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedEl = listRef.current.querySelector('[aria-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }
    }
  }, [isOpen]);

  const handleSelectOption = (val: string) => {
    onChange(val);
    setInputValue(formatTimeLabel(val));
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const parsed = parseTypedTime(inputValue);
      if (parsed) {
        const formattedVal = formatTimeValue(parsed.hour, parsed.minute);
        if (minTime && formattedVal < minTime) {
          setInputValue(value ? formatTimeLabel(value) : '');
        } else if (formattedVal !== value) {
          onChange(formattedVal);
        } else {
          setInputValue(formatTimeLabel(formattedVal));
        }
      } else {
        if (!inputValue.trim() && allowClear) {
          onChange('');
        } else {
          setInputValue(value ? formatTimeLabel(value) : '');
        }
      }
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setInputValue(value ? formatTimeLabel(value) : '');
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full" ref={containerRef} title={description || title}>
      <div className="relative">
        <input
          ref={inputRef}
          id={fieldId}
          type="text"
          className={cn(
            'journey-planner-field h-[52px] w-full rounded-2xl border px-4 py-3 pr-12 text-sm outline-hidden transition',
            disabled
              ? 'bg-slate-50 text-slate-400 opacity-70 cursor-not-allowed'
              : 'text-slate-900',
            className,
          )}
          disabled={disabled}
          placeholder={placeholder}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-label={title}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute inset-y-0 right-4 flex items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-hidden disabled:cursor-not-allowed"
          onClick={(e) => {
            e.stopPropagation();
            if (isOpen) {
              setIsOpen(false);
            } else {
              setIsOpen(true);
              inputRef.current?.focus();
            }
          }}
          disabled={disabled}
        >
          <ClockIcon className="h-4 w-4" />
        </button>
      </div>

      {isOpen && !disabled && (
        <div
          ref={listRef}
          className="journey-planner-card absolute right-0 left-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border p-1 shadow-xl"
          role="listbox"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            const isDisabled = minTime ? opt.value < minTime : false;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={isDisabled}
                className={cn(
                  'w-full rounded-xl px-4 py-2.5 text-left text-sm transition-colors duration-150',
                  isSelected
                    ? 'bg-[var(--journey-planner-accent)] font-semibold text-white dark:text-slate-950'
                    : isDisabled
                      ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50'
                      : 'text-[var(--journey-planner-primary-text)] hover:bg-[var(--journey-planner-accent-soft)] hover:text-[var(--journey-planner-accent)]',
                )}
                onMouseDown={(e) => {
                  if (isDisabled) {
                    e.preventDefault();
                    return;
                  }
                  // Prevent input focus loss so click event registers properly
                  e.preventDefault();
                  handleSelectOption(opt.value);
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
