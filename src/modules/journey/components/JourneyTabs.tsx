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
      <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.04] p-4">
        <p className="text-sm text-slate-400 sm:text-base">This journey doesn&apos;t have any planned days yet.</p>
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
              ? 'border-[#f8d775]/30 bg-[#f8d775]/12 text-white shadow-lg shadow-black/20'
              : 'border-white/10 bg-white/[0.04] text-slate-300 shadow-[0_16px_30px_-24px_rgba(0,0,0,0.9)] hover:border-white/15 hover:bg-white/[0.07]'
          }`}
          onClick={() => onSelectDay(day.dayNumber)}
          type="button"
        >
          <div className="flex items-center justify-between gap-3">
            <span className={`text-xs font-semibold tracking-[0.2em] uppercase ${activeDayNumber === day.dayNumber ? 'text-[#f8d775]' : 'text-slate-500'}`}>
              Day
              {' '}
              {day.dayNumber + 1}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${activeDayNumber === day.dayNumber ? 'bg-white/10 text-slate-100' : 'bg-white/[0.06] text-slate-400'}`}>
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
