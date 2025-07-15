import UserStats from "../../components/UserStats";
import ProfileActions from "../../components/ProfileActions";
import JourneyCard from "../../components/JourneyCard";
import Button from "@/components/ui/Button";
import Image from "next/image";

export default function ProfilePage() {
  const journeys = [
    {
      id: 1,
      image:
        "/image.png?format=webp&width=400",
      imageAlt: "Dubai cityscape",
      dateRange: "15 Jan 2024 • 17 Jan 2024",
      title: "Dubai Trip",
      location: "Dubai",
      status: "completed" as const,
      highlight: "Burj Khalifa Tour",
    },
    {
      id: 2,
      image:
        "/image.png?format=webp&width=400",
      imageAlt: "Dubai cityscape",
      dateRange: "15 Jan 2024 • 17 Jan 2024",
      title: "Dubai Trip",
      location: "Dubai",
      status: "completed" as const,
      highlight: "Burj Khalifa Tour",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col items-start gap-6 flex-1 w-full max-w-4xl mx-auto p-6">
        {/* Profile Header Card */}
        <div className="flex flex-col justify-center items-start -gap-12 w-full rounded-md bg-white shadow-lg overflow-hidden">
          {/* Hero Background Image */}
          <img
            src="/london.png?format=webp&width=800"
            alt="Profile background"
            className="h-[270px] w-full object-cover"
          />

          {/* Avatar and Stats Section */}
          <div className="flex h-48 pb-6 px-6 items-end gap-20 w-full -mt-12">
            <div className="flex flex-col justify-center items-center gap-2">
              {/* Avatar Container */}
              <div className="w-30 h-30 rounded-lg relative">
                {/* Background with gradient */}
                <div className="w-30 h-30 absolute left-0 top-0">
                  <div className="w-30 h-30 rounded-lg bg-primary-purple absolute left-0 top-0" />
                  <div className="w-24 h-24 rounded-lg bg-white bg-opacity-30 absolute left-3 top-3" />
                </div>
                {/* Avatar Image - using a placeholder */}
                <div className="w-30 h-30 rounded-lg absolute left-0 top-0 bg-gray-300 flex items-center justify-center text-white text-2xl font-bold">
                  <Image src="/avatar.png" alt="profile" width={120} height={120} />
                </div>
              </div>

              {/* Name */}
              <h1 className="text-heading font-mulish text-[22px] font-bold leading-7">
                Belle Ferguson
              </h1>
            </div>

            {/* Stats */}
            <div className="flex items-start gap-20 flex-1 pb-6">
              <UserStats
                posts="20"
                journeys="100"
                followers="100 K"
                following="100"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <ProfileActions />

        {/* My Journey Section */}
        <div className="flex flex-col items-start gap-4 w-full">
          <div className="flex justify-center items-center gap-2.5 w-full">
            <h2 className="flex-1 text-black font-outfit text-2xl font-medium leading-[120%]">
              My Journey
            </h2>
            <Button variant="primary" size="lg">
              Create new Journey
            </Button>
          </div>

          {/* Journey Cards */}
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
  );
}
