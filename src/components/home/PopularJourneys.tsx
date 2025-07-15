import ArrowDownIcon from "../icons/ArrowDownIcon";
import Button from "../ui/Button";
import JourneyItem from "./JourneyItem";

export default function PopularJourneys() {
  const journeys = [
    {
      id: 1,
      title: "Dubai Trip",
      location: "Dubai",
      dateRange: "15 Jan • 17 Jan",
      image:
        "/image.png?format=webp&width=200",
      imageAlt: "Dubai cityscape",
    },
    {
      id: 2,
      title: "Dubai Trip",
      location: "Dubai",
      dateRange: "15 Jan • 17 Jan",
      image:
        "/image.png?format=webp&width=200",
      imageAlt: "Forest landscape",
    },
    {
      id: 3,
      title: "Dubai Trip",
      location: "Dubai",
      dateRange: "15 Jan • 17 Jan",
      image:
        "/image.png?format=webp&width=200",
      imageAlt: "Dubai cityscape",
    },
    {
      id: 4,
      title: "Dubai Trip",
      location: "Dubai",
      dateRange: "15 Jan • 17 Jan",
      image:
        "/image.png?format=webp&width=200",
      imageAlt: "Forest landscape",
    },
    {
      id: 5,
      title: "Dubai Trip",
      location: "Dubai",
      dateRange: "15 Jan • 17 Jan",
      image:
        "/image.png?format=webp&width=200",
      imageAlt: "Dubai cityscape",
    },
    {
      id: 6,
      title: "Dubai Trip",
      location: "Dubai",
      dateRange: "15 Jan • 17 Jan",
      image:
        "/image.png?format=webp&width=200",
      imageAlt: "Forest landscape",
    },
  ];

  return (
    <div className="flex flex-col p-3 gap-11 flex-1 bg-white bg-opacity-80 rounded-lg shadow-card">
      <div className="flex flex-col justify-center items-center gap-6 w-full">
        {/* Card Header */}
        <div className="flex flex-col items-start gap-4 w-full">
          <div className="flex items-start gap-4 w-full">
            <h2 className="flex-1 text-lg font-bold text-gray-900 font-manrope leading-7">
              Popular Journey
            </h2>
            <div className="flex items-center gap-3">
              {/* More options button placeholder */}
              <div className="w-5 h-5" />
            </div>
          </div>
          <div className="h-px w-full bg-gray-200" />
        </div>

        {/* Journey List */}
        <div className="flex flex-col items-start gap-4 w-full">
          {journeys.map((journey) => (
            <JourneyItem
              key={journey.id}
              title={journey.title}
              location={journey.location}
              dateRange={journey.dateRange}
              image={journey.image}
              imageAlt={journey.imageAlt}
            />
          ))}
        </div>

        {/* Load More Button */}
        <Button
          variant="secondary-color"
          size="sm"
          icon={<ArrowDownIcon className="text-primary-blue" />}
          iconPosition="leading"
        >
          Load more
        </Button>
      </div>
    </div>
  );
}
