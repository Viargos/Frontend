import type { JourneyDay } from '@/modules/journey/types/journey-detail.types';

function formatTabDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
}

type JourneyTabsProps = {
  activeDayNumber: number;
  days: JourneyDay[];
  onSelectDay: (dayNumber: number) => void;
};

export const JourneyTabs = (props: JourneyTabsProps) => {
  const {
    activeDayNumber,
    days,
    onSelectDay,
  } = props;

  if (days.length === 0) {
    return (
      <div className="journey-planner-empty-state rounded-2xl border border-dashed p-4">
        <p className="journey-planner-copy text-sm sm:text-base">This journey doesn&apos;t have any planned days yet.</p>
      </div>
    );
  }

  return (
    <div className="scrollbar-hide -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
      {days.map(day => (
        <button
          key={day.id ?? `day-${day.dayNumber}`}
          className={`journey-day-chip min-w-[152px] shrink-0 rounded-2xl border px-4 py-3 text-left transition-all ${
            activeDayNumber === day.dayNumber
              ? 'journey-day-chip-active'
              : ''
          }`}
          onClick={() => onSelectDay(day.dayNumber)}
          type="button"
        >
          <div className="flex items-center justify-between gap-3">
            <span className={`text-xs font-semibold tracking-[0.2em] uppercase ${activeDayNumber === day.dayNumber ? 'text-[var(--journey-planner-accent)]' : 'journey-planner-label'}`}>
              Day
              {' '}
              {day.dayNumber + 1}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              activeDayNumber === day.dayNumber
                ? 'bg-[var(--journey-planner-accent-soft)] text-[var(--journey-planner-accent)]'
                : 'border border-[var(--journey-planner-subcard-border)] bg-[var(--journey-planner-subcard-bg)] text-[var(--journey-planner-muted-text)]'
            }`}
            >
              {day.places.length}
              {' '}
              stops
            </span>
          </div>

          <p className={`mt-2 text-sm font-semibold ${activeDayNumber === day.dayNumber ? 'journey-planner-title' : 'journey-planner-copy'}`}>
            {formatTabDate(day.date)}
          </p>
        </button>
      ))}
    </div>
  );
};
