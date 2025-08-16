"use client";

import { useState } from "react";
import DayFilter from "@/components/journey/DayFilter";
import PlanningCategory from "@/components/journey/PlanningCategory";
import MapLocationMarker from "@/components/journey/MapLocationMarker";
import PlaceToStayIcon from "@/components/icons/PlaceToStayIcon";
import { TreesIcon } from "@/components/icons/TreesIcon";
import { FoodIcon } from "@/components/icons/FoodIcon";
import { TransportIcon } from "@/components/icons/TransportIcon";
import { NotesIcon } from "@/components/icons/NotesIcon";
import Button from "@/components/ui/Button";

export default function CreateJourneyPage() {
  const [activeDay, setActiveDay] = useState("Day 1");

  const days = ["Day 1", "Day 2", "Day 3"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex p-6 flex-col items-center gap-6 flex-1 rounded-lg shadow-lg relative">
        {/* Hero Image */}
        <img
          src="/london.png?format=webp&width=800"
          alt="Journey destination"
          className="w-full flex-1 rounded-lg object-cover"
        />

        {/* Main Content */}
        <div className="flex justify-center items-start gap-6 w-full">
          {/* Left Content */}
          <div className="flex flex-col items-start gap-8 flex-1">
            {/* Header */}
            <div className="flex px-6 pb-3 items-center gap-3 w-full border-b border-gray-300">
              <h1 className="flex-1 text-black font-outfit text-2xl font-medium leading-[120%]">
                Journey Details
              </h1>
              <Button variant="primary" size="lg">
                Review & Post
              </Button>
            </div>

            {/* Day Filter */}
            <DayFilter
              days={days}
              activeDay={activeDay}
              onDayChange={setActiveDay}
            />

            {/* Day Content */}
            <div className="flex flex-col items-start gap-6 w-full">
              {/* Day 1 - Active */}
              {activeDay === "Day 1" && (
                <div className="flex p-6 flex-col justify-center items-start gap-6 w-full rounded-lg border-b border-gray-300 bg-white">
                  <div className="flex flex-col justify-center items-start gap-8 w-full">
                    {/* Day Header */}
                    <div className="flex min-w-32 flex-col items-start gap-2 w-full">
                      <div className="text-gray-600 font-manrope text-sm font-normal leading-5 w-full">
                        Day 1
                      </div>
                      <div className="text-gray-900 font-manrope text-base font-semibold leading-6 w-full">
                        Saturday 15 Feb
                      </div>
                    </div>

                    {/* Planning Categories */}
                    <div className="flex items-center gap-4">
                      <PlanningCategory
                        icon={<PlaceToStayIcon />}
                        label="Place to stay"
                        isActive={true}
                      />
                      <PlanningCategory
                        icon={<TreesIcon className="text-black" />}
                        label="Places to go"
                      />
                      <PlanningCategory
                        icon={<FoodIcon className="text-black" />}
                        label="Food"
                      />
                      <PlanningCategory
                        icon={<TransportIcon className="text-black w-10 h-4" />}
                        label="Transport"
                      />
                      <PlanningCategory
                        icon={<NotesIcon className="text-black" />}
                        label="Notes"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Things to Do Section */}
              <div className="flex flex-col items-start gap-6 w-full">
                <div className="flex p-3 flex-col items-start gap-2.5 w-full rounded-lg border-2 border-dashed border-gray-200 bg-white">
                  <div className="flex justify-between items-end w-full">
                    <div className="flex items-center gap-6">
                      <div className="flex min-w-12 min-h-12 flex-col justify-center items-center gap-2 rounded-full border border-gray-200 bg-gray-100">
                        <div className="w-6 h-6 opacity-70">
                          <TreesIcon className="text-black" />
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-3">
                        <div className="text-gray-600 font-manrope text-sm font-normal leading-5">
                          Things to do
                        </div>
                        <div className="text-gray-900 font-manrope text-sm font-semibold leading-5">
                          Pick a thing to do on your first day in town
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-900 font-manrope text-sm font-semibold leading-5 underline">
                      Add Locations
                    </button>
                  </div>
                </div>

                {/* Add Hotel */}
                <div className="flex px-3 items-center gap-2.5 w-full">
                  <button className="text-gray-900 font-manrope text-sm font-semibold leading-5 underline">
                    Add Hotel
                  </button>
                </div>
              </div>

              {/* Day 2 */}
              <div className="flex h-27 px-6 py-5 justify-between items-center w-full rounded-lg border-b border-gray-300 opacity-80 bg-white">
                <div className="flex flex-col items-start gap-3">
                  <div className="text-gray-600 font-manrope text-sm font-normal leading-5">
                    Day 2
                  </div>
                  <div className="text-gray-900 font-manrope text-base font-semibold leading-6">
                    Saturday 16 Feb
                  </div>
                </div>
                <button className="text-gray-900 font-manrope text-sm font-semibold leading-5 underline">
                  Add Locations
                </button>
              </div>

              {/* Day 3 */}
              <div className="flex h-27 px-6 py-5 justify-between items-center w-full rounded-lg border-b border-gray-300 opacity-80 bg-white">
                <div className="flex flex-col items-start gap-3">
                  <div className="text-gray-600 font-manrope text-sm font-normal leading-5">
                    Day 3
                  </div>
                  <div className="text-gray-900 font-manrope text-base font-semibold leading-6">
                    Saturday 17 Feb
                  </div>
                </div>
                <button className="text-gray-900 font-manrope text-sm font-semibold leading-5 underline">
                  Add Locations
                </button>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="w-90 h-full relative">
            <div className="w-full h-[724px] rounded bg-gray-200 relative overflow-hidden shadow-inner">
              {/* Placeholder map background */}
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 relative">
                {/* Location Markers */}
                <div className="absolute top-16 left-16">
                  <MapLocationMarker />
                </div>

                <div className="absolute top-80 right-16">
                  <MapLocationMarker />
                </div>

                <div className="absolute bottom-32 left-20">
                  <MapLocationMarker />
                </div>

                {/* Route Path */}
                <svg
                  className="absolute top-20 left-28 w-31 h-124 stroke-primary-dark"
                  width="124"
                  height="498"
                  viewBox="0 0 124 498"
                  fill="none"
                >
                  <path
                    d="M122.59 497C80.7567 454.167 -2.10993 350 1.09007 276C5.09007 183.5 53.5898 67 10.5898 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                </svg>

                {/* Map Labels - Sample */}
                <div className="absolute top-12 right-8 text-xs text-gray-600 font-manrope">
                  JARDIN PUBLIC
                </div>
                <div className="absolute top-32 right-12 text-xs text-gray-600 font-manrope">
                  CHARTRONS
                </div>
                <div className="absolute bottom-20 left-8 text-xs text-gray-600 font-manrope">
                  SAINT-MICHEL
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
