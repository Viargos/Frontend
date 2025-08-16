import ArrowUpRightIcon from "@/components/icons/ArrowUpRightIcon";
import CalendarIcon from "@/components/icons/CalendarIcon";
import LocationIcon from "@/components/icons/LocationIcon";


interface JourneyItemProps {
  title: string;
  location: string;
  dateRange: string;
  image: string;
  imageAlt: string;
}

export default function JourneyItem({
  title,
  location,
  dateRange,
  image,
  imageAlt,
}: JourneyItemProps) {
  return (
    <div className="flex items-start gap-4 w-full">
      <div className="relative w-[102px] h-[84px] flex-shrink-0 rounded-md overflow-hidden">
        <img
          src={image}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-10 rounded-md" />
      </div>

      <div className="flex flex-col justify-between flex-1 h-[84px]">
        <div className="flex justify-between items-center w-full">
          <h3 className="text-base font-bold text-gray-900 font-manrope leading-7">
            {title}
          </h3>
          <ArrowUpRightIcon className="text-gray-400 w-3.5 h-3.5" size={14} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <LocationIcon className="text-gray-400 w-4 h-4" size={16} />
            <span className="text-sm font-semibold text-gray-600 font-manrope leading-4">
              {location}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="text-gray-400 w-4 h-4" size={16} />
            <span className="text-xs font-semibold text-gray-600 font-manrope leading-4">
              {dateRange}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
