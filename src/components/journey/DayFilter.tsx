interface DayFilterProps {
  days: string[];
  activeDay: string;
  onDayChange: (day: string) => void;
  onAddDay?: () => void;
  onDeleteDay?: (day: string) => void;
}

export default function DayFilter({
  days,
  activeDay,
  onDayChange,
  onAddDay,
  onDeleteDay,
}: DayFilterProps) {
  return (
    <div className="flex items-center gap-3 overflow-x-scroll scrollbar-hide w-full py-2">
      {/* Scrollable day buttons container */}
      <div className="flex items-center gap-3">
        {days.map((day) => (
          <div key={day} className="relative flex-shrink-0">
            <button
              onClick={() => onDayChange(day)}
              className={`
                flex w-25 px-4 py-1 justify-center items-center gap-2 rounded-2xl shadow-button font-manrope text-base font-semibold leading-6
                ${
                  activeDay === day
                    ? "bg-primary-blue text-white"
                    : "border border-primary-blue text-primary-blue bg-white hover:bg-blue-50"
                }
              `}
            >
              {day}
            </button>
            
            {/* Delete button - only show if there's more than 1 day and onDeleteDay is provided */}
            {days.length > 1 && onDeleteDay && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDay(day);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-sm"
                title={`Delete ${day}`}
              >
                ×
              </button>
            )}
          </div>
        ))}
        
        {/* Add Day Button */}
        {onAddDay && (
          <button
            onClick={onAddDay}
            className="flex w-25 px-4 py-[2px] justify-center items-center gap-2 rounded-2xl shadow-button font-manrope text-base font-semibold leading-6 flex-shrink-0 border-2 border-dashed border-primary-blue text-primary-blue bg-white hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            + Add Day
          </button>
        )}
      </div>
    </div>
  );
}
