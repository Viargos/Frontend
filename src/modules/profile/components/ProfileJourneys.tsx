import type { ProfileJourney } from '@/modules/profile/types/profile.types';
import * as motion from 'framer-motion/client';
import Image from 'next/image';

type ProfileJourneysProps = {
  journeys: ProfileJourney[];
  ownerName: string;
};

export const ProfileJourneys = (props: ProfileJourneysProps) => {
  const { journeys, ownerName } = props;

  if (journeys.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        {ownerName}
        {' '}
        has no journeys yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {journeys.map((journey, index) => (
        <motion.article
          key={journey.id}
          className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          whileHover={{ y: -1 }}
        >
          <div className="relative h-36 bg-gray-100">
            {journey.coverImage
              ? <Image alt={journey.title} className="h-full w-full object-cover" fill src={journey.coverImage} unoptimized />
              : null}
          </div>
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900">{journey.title}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-gray-500">{journey.description ?? 'No description'}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
};
