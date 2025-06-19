interface YearFilterProps {
  years: string[];
  activeYear: string;
  onYearChange: (year: string) => void;
}

export default function YearFilter({
  years,
  activeYear,
  onYearChange,
}: YearFilterProps) {
  return (
    <div className="flex items-center gap-3">
      {years.map((year) => (
        <button
          key={year}
          onClick={() => onYearChange(year)}
          className={`
            flex w-25 px-4 py-1 justify-center items-center gap-2 rounded-2xl shadow-button font-manrope text-base font-medium leading-6
            ${
              activeYear === year
                ? "bg-primary-blue text-white border border-primary-blue"
                : "border border-primary-blue text-primary-blue bg-white hover:bg-blue-50"
            }
          `}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
