import Header from "@/components/home/Header";
import PopularJourneys from "@/components/home/PopularJourneys";


export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header />

        {/* Main Content Layout */}
        <div className="flex gap-6 lg:gap-8">
          {/* Main Journey Gallery */}
          <div className="flex-1 max-w-3xl">
            {/* <JourneyGallery /> */}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <PopularJourneys />
          </div>
        </div>
      </div>
    </div>
  );
}
