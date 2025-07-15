"use client";

import { useState } from "react";
import YearFilter from "../../components/YearFilter";
import JourneyCard from "../../components/JourneyCard";
import Button from "@/components/ui/Button";

export default function JourneysPage() {
  const [activeYear, setActiveYear] = useState("2022");

  const years = ["2022", "2024", "2025"];

  const journeys = [
    {
      id: 1,
      image:
        "/journey_image.png?format=webp&width=400",
      imageAlt: "Dubai cityscape with Burj Khalifa",
      dateRange: "15 Jan 2024 • 17 Jan 2024",
      title: "Dubai Trip",
      location: "Dubai",
      status: "completed" as const,
      highlight: "Burj Khalifa Tour",
    },
    {
      id: 2,
      image:
        "journey_image.png?format=webp&width=400",
      imageAlt: "London skyline with Tower Bridge",
      dateRange: "15 Jan 2024 • 17 Jan 2024",
      title: "London Trip",
      location: "Dubai",
      status: "completed" as const,
      highlight: "London Eye",
    },
    {
      id: 3,
      image:
        "journey_image.png?format=webp&width=400",
      imageAlt: "Assam landscape with waterfall",
      dateRange: "15 Jan 2024 • 17 Jan 2024",
      title: "Assam Trip",
      location: "Dubai",
      status: "completed" as const,
      highlight: "London Eye",
    },
    {
      id: 4,
      image:
        "/journey_image.png?format=webp&width=400",
      imageAlt: "Kashmir mountains and lake",
      dateRange: "15 Jan 2024 • 17 Jan 2024",
      title: "Kashmir Trip",
      location: "Dubai",
      status: "completed" as const,
      highlight: "London Eye",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <div className="flex p-6 flex-col items-center gap-6 flex-1 max-w-4xl rounded-lg bg-white shadow-lg">
        {/* Header Section */}
        <div className="flex flex-col items-start gap-4 w-full">
          {/* Title and Create Button */}
          <div className="flex justify-center items-center gap-2.5 w-full">
            <h1 className="flex-1 text-black font-manrope text-2xl font-semibold leading-[120%]">
              My Journeys
            </h1>
            <Button variant="primary" size="lg">
              Create new journey
            </Button>
          </div>

          {/* Year Filter */}
          <YearFilter
            years={years}
            activeYear={activeYear}
            onYearChange={setActiveYear}
          />

          {/* Journey List */}
          <div className="flex flex-col items-start gap-4 w-full">
            <div className="flex flex-col items-start gap-3 w-full">
              {journeys.map((journey) => (
                <JourneyCard
                  key={journey.id}
                  image={journey.image}
                  imageAlt={journey.imageAlt}
                  dateRange={journey.dateRange}
                  title={journey.title}
                  location={journey.location}
                  status={journey.status}
                  highlight={journey.highlight}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
