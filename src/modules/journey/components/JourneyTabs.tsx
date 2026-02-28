import type { JourneyDay } from '@/modules/journey/types/journey-detail.types';

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
      <div className="mb-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:mb-6 sm:p-4">
        <p className="text-sm text-[#160E53] sm:text-base">This journey doesn&apos;t have any days planned yet.</p>
      </div>
    );
  }

  return (
    <div className="scrollbar-hide -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mb-6 sm:px-0">
      {days.map(day => (
        <button
          key={day.id ?? `day-${day.dayNumber}`}
          className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
            activeDayNumber === day.dayNumber
              ? 'scale-105 bg-[#160E53] text-white shadow-md'
              : 'border border-gray-200 bg-white text-gray-700 shadow-sm hover:border-[#160E53] hover:text-[#160E53]'
          }`}
          onClick={() => onSelectDay(day.dayNumber)}
          type="button"
        >
          Day
          {' '}
          {day.dayNumber + 1}
        </button>
      ))}
    </div>
  );
};
