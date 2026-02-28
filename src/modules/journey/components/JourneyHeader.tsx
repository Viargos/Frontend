import type { JourneyDetail } from '@/modules/journey/types/journey-detail.types';
import Image from 'next/image';

type JourneyHeaderProps = {
  journey: JourneyDetail;
  onBack: () => void;
};

export const JourneyHeader = (props: JourneyHeaderProps) => {
  const { journey, onBack } = props;
  const coverImageSrc = journey.coverImage ?? '/london.png';

  return (
    <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg sm:mb-6 sm:h-56 md:h-64 lg:h-72">
      <Image
        alt="Journey cover"
        className="object-cover"
        fill
        priority
        src={coverImageSrc}
        unoptimized
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8">
        <h1 className="mb-2 text-2xl font-bold text-white drop-shadow-lg sm:text-3xl md:text-4xl lg:text-5xl">
          {journey.title}
        </h1>
        {journey.description
          ? (
              <p className="line-clamp-2 max-w-3xl text-sm text-white/90 drop-shadow-md sm:text-base md:text-lg">
                {journey.description}
              </p>
            )
          : null}
      </div>

      <button
        className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-white/20 px-2 py-1 text-xs text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/30 sm:top-4 sm:left-4 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
        onClick={onBack}
        type="button"
      >
        <span aria-hidden="true" className="h-3 w-3 text-center leading-3 sm:h-4 sm:w-4 sm:leading-4">←</span>
        <span className="hidden sm:inline">Back</span>
      </button>
    </div>
  );
};
