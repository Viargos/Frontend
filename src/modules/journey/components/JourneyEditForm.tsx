'use client';

import type { FormEvent } from 'react';
import type { JourneyDetail } from '@/modules/journey/types/journey-detail.types';
import * as motion from 'framer-motion/client';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button, Input } from '@/modules/common';
import { useJourneyActions } from '@/modules/journey/hooks';

type JourneyEditFormProps = {
  journey: JourneyDetail;
};

function getTotalPlaces(journey: JourneyDetail): number {
  return journey.days.reduce((total, day) => total + day.places.length, 0);
}

export const JourneyEditForm = (props: JourneyEditFormProps) => {
  const { journey } = props;
  const { updateJourney } = useJourneyActions();
  const router = useRouter();
  const [title, setTitle] = useState(journey.title);
  const [description, setDescription] = useState(journey.description ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPlaces = useMemo(() => getTotalPlaces(journey), [journey]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await updateJourney(journey.id, {
        description,
        title,
      });
      router.push(`/journey/${journey.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to update journey');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl space-y-6"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
    >
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.25 }}
      >
        <div className="bg-gradient-to-br from-[#160E53] via-[#1d1563] to-[#0891b2] px-6 py-7 text-white">
          <h1 className="text-2xl font-bold">Edit Journey</h1>
          <p className="mt-1 text-sm text-white/85">Update your journey details while keeping your itinerary intact.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 border-b border-gray-100 bg-gray-50 px-6 py-4 text-sm text-gray-700 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
            <p className="text-xs text-gray-500">Days</p>
            <p className="mt-0.5 font-semibold text-[#160E53]">{journey.days.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
            <p className="text-xs text-gray-500">Places</p>
            <p className="mt-0.5 font-semibold text-[#160E53]">{totalPlaces}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
            <p className="text-xs text-gray-500">Last Updated</p>
            <p className="mt-0.5 font-semibold text-[#160E53]">{new Date(journey.updatedAt ?? journey.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-4 px-6 py-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900" htmlFor="journey-title">Journey Name</label>
            <Input
              id="journey-title"
              className="border-gray-300 bg-white text-gray-900"
              value={title}
              onChange={event => setTitle(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900" htmlFor="journey-description">Description</label>
            <textarea
              id="journey-description"
              className="min-h-32 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition outline-none focus:border-[#160E53] focus:ring-2 focus:ring-[#160E53]/20"
              placeholder="Describe this journey..."
              value={description}
              onChange={event => setDescription(event.target.value)}
            />
          </div>
        </div>
      </motion.section>

      {error
        ? (
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              initial={{ opacity: 0, y: 8 }}
            >
              {error}
            </motion.p>
          )
        : null}

      <div className="flex items-center justify-end gap-3">
        <Button
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
          type="button"
          variant="outline"
          onClick={() => router.push(`/journey/${journey.id}`)}
        >
          Cancel
        </Button>
        <Button
          className="bg-[#160E53] text-white hover:bg-[#2a1f6f]"
          disabled={isSubmitting}
          type="submit"
          variant="default"
        >
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </motion.form>
  );
};
