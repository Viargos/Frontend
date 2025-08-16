interface DayFilterProps {
  days: string[];
  activeDay: string;
  onDayChange: (day: string) => void;
}

export default function DayFilter({
  days,
  activeDay,
  onDayChange,
}: DayFilterProps) {
  return (
    <div className="flex pl-6 items-center gap-3">
      {days.map((day) => (
        <button
          key={day}
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
      ))}
    </div>
  );
}
