import React from "react";

const RightSidebar = () => {
  const popularJourneys = [
    {
      id: 1,
      title: "Dubai Trip",
      location: "Dubai",
      dateRange: "15 Jan • 17 Jan",
      image: "/london.png",
    },
    {
      id: 2,
      title: "Dubai Trip",
      location: "Dubai",
      dateRange: "15 Jan • 17 Jan",
      image: "/journey_image.png",
    },
    {
      id: 3,
      title: "Dubai Trip",
      location: "Dubai",
      dateRange: "15 Jan • 17 Jan",
      image: "/london.png",
    },
    {
      id: 4,
      title: "Dubai Trip",
      location: "Dubai",
      dateRange: "15 Jan • 17 Jan",
      image: "/journey_image.png",
    },
    {
      id: 5,
      title: "Dubai Trip",
      location: "Dubai",
      dateRange: "15 Jan • 17 Jan",
      image: "/london.png",
    },
    {
      id: 6,
      title: "Dubai Trip",
      location: "Dubai",
      dateRange: "15 Jan • 17 Jan",
      image: "/journey_image.png",
    },
  ];

  return (
    <div className="h-full bg-gray-100">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Popular Journey
        </h2>

        <div className="space-y-3">
          {popularJourneys.map((journey) => (
            <div
              key={journey.id}
              className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={journey.image}
                  alt={journey.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {journey.title}
                </h3>
                <div className="flex items-center text-xs text-gray-500 space-x-2 mt-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{journey.location}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500 space-x-2 mt-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{journey.dateRange}</span>
                </div>
              </div>

              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          Load more
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;
