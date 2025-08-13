import Badge from "./Badge";
import ArrowUpRightIcon from "./icons/ArrowUpRightIcon";
import LocationIcon from "./icons/LocationIcon";
import { BuildingMonumentIcon } from "./icons/BuildingMonumentIcon";

interface JourneyCardProps {
  image: string;
  imageAlt: string;
  dateRange: string;
  title: string;
  location: string;
  status: "completed" | "ongoing";
  highlight?: string;
}

export default function JourneyCard({
  image,
  imageAlt,
  dateRange,
  title,
  location,
  status,
  highlight,
}: JourneyCardProps) {
  return (
    <div className="flex p-3.5 flex-col items-start gap-2.5 w-full rounded-[10px] border border-gray-200 border-opacity-20 bg-white">
      <div className="flex items-center gap-6 w-full">
        {/* Journey Image */}
        <div className="flex w-[260px] h-[150px] justify-center items-center rounded-md border border-gray-200 overflow-hidden">
          <img
            src={image}
            alt={imageAlt}
            className="h-[150px] w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col items-start gap-6 flex-1">
          {/* Header */}
          <div className="flex flex-col items-start gap-3 w-full">
            {/* Date */}
            <div className="text-[#314689] font-manrope text-sm font-semibold leading-5 w-full">
              {dateRange}
            </div>

            {/* Title and Icon */}
            <div className="flex items-start gap-4 w-full">
              <h3 className="flex-1 text-gray-700 font-manrope text-2xl font-semibold leading-8">
                {title}
              </h3>
              <div className="flex pt-1 flex-col items-start">
                <ArrowUpRightIcon className="text-gray-900 w-6 h-6" size={24} />
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 w-full">
              <div className="flex items-center gap-2">
                <LocationIcon className="text-gray-400 w-4 h-4" size={16} />
                <span className="text-gray-600 font-manrope text-sm font-semibold leading-4">
                  {location}
                </span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-start gap-2 w-full">
            <Badge variant="success">
              {status === "completed" ? "Completed" : "Ongoing"}
            </Badge>

            {highlight && (
              <Badge
                variant="indigo"
                icon={<BuildingMonumentIcon className="text-indigo-700" />}
              >
                Highlight: {highlight}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
