import type { JourneyMedia } from '@/modules/journey/types/journey-detail.types';
import Image from 'next/image';

type MediaGalleryProps = {
  media: JourneyMedia[];
  onView: (index: number) => void;
};

export const MediaGallery = (props: MediaGalleryProps) => {
  const { media, onView } = props;

  if (media.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
      {media.map((item, index) => (
        <button
          key={item.id}
          className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200"
          onClick={() => onView(index)}
          type="button"
        >
          {item.type === 'video'
            ? <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-500">Video</div>
            : <Image alt="Place media" className="object-cover" fill src={item.url} unoptimized />}
        </button>
      ))}
    </div>
  );
};
