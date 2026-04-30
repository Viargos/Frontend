const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  weekday: 'short',
  year: 'numeric',
});

const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

const TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
});

export type CalendarDay = {
  date: Date;
  isoValue: string;
  isCurrentMonth: boolean;
  isToday: boolean;
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function parseNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function createLocalDate(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, day);
}

export function getTodayDateValue(): string {
  return formatDateValue(new Date());
}

export function parseDateValue(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const [yearValue, monthValue, dayValue] = value.split('-');
  const year = parseNumber(yearValue ?? '');
  const month = parseNumber(monthValue ?? '');
  const day = parseNumber(dayValue ?? '');

  if (!year || !month || !day) {
    return null;
  }

  const parsedDate = createLocalDate(year, month - 1, day);
  if (
    parsedDate.getFullYear() !== year
    || parsedDate.getMonth() !== month - 1
    || parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

export function formatDateValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDateLabel(value?: string | null): string {
  const parsedDate = parseDateValue(value);
  return parsedDate ? DATE_FORMATTER.format(parsedDate) : '';
}

export function formatMonthLabel(date: Date): string {
  return MONTH_FORMATTER.format(date);
}

export function isSameDate(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

export function isDateDisabled(date: Date, min?: string, max?: string): boolean {
  const isoValue = formatDateValue(date);
  return Boolean((min && isoValue < min) || (max && isoValue > max));
}

export function getCalendarDays(viewDate: Date): CalendarDay[] {
  const monthStart = createLocalDate(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const gridStart = createLocalDate(
    monthStart.getFullYear(),
    monthStart.getMonth(),
    monthStart.getDate() - monthStart.getDay(),
  );
  const today = new Date();

  return Array.from({ length: 42 }, (_, index) => {
    const date = createLocalDate(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index,
    );

    return {
      date,
      isoValue: formatDateValue(date),
      isCurrentMonth: date.getMonth() === viewDate.getMonth(),
      isToday: isSameDate(date, today),
    };
  });
}

export function addMonths(date: Date, monthOffset: number): Date {
  return createLocalDate(date.getFullYear(), date.getMonth() + monthOffset, 1);
}

export function getInitialMonth(value?: string, fallbackValue?: string): Date {
  return parseDateValue(value) ?? parseDateValue(fallbackValue) ?? createLocalDate(new Date().getFullYear(), new Date().getMonth(), 1);
}

export function parseTimeValue(value?: string | null): { hour: number; minute: number } | null {
  if (!value) {
    return null;
  }

  const [hourValue, minuteValue] = value.split(':');
  const hour = parseNumber(hourValue ?? '');
  const minute = parseNumber(minuteValue ?? '');

  if (
    hour == null
    || minute == null
    || hour < 0
    || hour > 23
    || minute < 0
    || minute > 59
  ) {
    return null;
  }

  return { hour, minute };
}

export function formatTimeValue(hour: number, minute: number): string {
  return `${pad(hour)}:${pad(minute)}`;
}

export function formatTimeLabel(value?: string | null): string {
  const parsedTime = parseTimeValue(value);
  if (!parsedTime) {
    return '';
  }

  const previewDate = createLocalDate(2026, 0, 1);
  previewDate.setHours(parsedTime.hour, parsedTime.minute, 0, 0);
  return TIME_FORMATTER.format(previewDate);
}

export function getTimeColumns() {
  return {
    hours: Array.from({ length: 24 }, (_, index) => index),
    minutes: Array.from({ length: 60 }, (_, index) => index),
  };
}

export function getDefaultTimeParts(value?: string | null): { hour: number; minute: number } {
  const parsedValue = parseTimeValue(value);
  if (parsedValue) {
    return parsedValue;
  }

  const currentTime = new Date();
  return {
    hour: currentTime.getHours(),
    minute: currentTime.getMinutes(),
  };
}
