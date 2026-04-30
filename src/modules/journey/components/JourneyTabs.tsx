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
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="text-sm text-slate-600 sm:text-base">This journey doesn&apos;t have any planned days yet.</p>
      </div>
    );
  }

  return (
    <div className="scrollbar-hide -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
      {days.map(day => (
        <button
          key={day.id ?? `day-${day.dayNumber}`}
          className={`min-w-[152px] shrink-0 rounded-2xl border px-4 py-3 text-left transition-all ${
            activeDayNumber === day.dayNumber
              ? 'border-[#160E53] bg-[#160E53] text-white shadow-lg shadow-[#160E53]/20'
              : 'border-slate-200 bg-white text-slate-700 shadow-sm hover:border-[#160E53]/40 hover:shadow-md'
          }`}
          onClick={() => onSelectDay(day.dayNumber)}
          type="button"
        >
          <div className="flex items-center justify-between gap-3">
            <span className={`text-xs font-semibold tracking-[0.2em] uppercase ${activeDayNumber === day.dayNumber ? 'text-white/70' : 'text-slate-400'}`}>
              Day
              {' '}
              {day.dayNumber + 1}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${activeDayNumber === day.dayNumber ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {day.places.length}
              {' '}
              stops
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold">
            {formatTabDate(day.date)}
          </p>
        </button>
      ))}
    </div>
  );
};
