'use client';

import { useEffect, useState } from 'react';

const COVER_IMAGES = [
  '/cover1.png',
  '/cover2.jpg',
  '/cover3.jpg',
] as const;

/**
 * Returns a stable cover image based on a hash of the provided seedId.
 * If no seedId is provided, it returns `/cover1.png`.
 * @param seedId - The optional value used to choose the same cover image consistently.
 */
export function getStableCoverImage(seedId?: string | null): string {
  if (!seedId) {
    return COVER_IMAGES[0];
  }

  let hash = 0;
  for (let i = 0; i < seedId.length; i++) {
    hash = seedId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COVER_IMAGES.length;
  return COVER_IMAGES[index]!;
}

/**
 * Returns a randomly selected cover image.
 */
export function getRandomCoverImage(): string {
  const index = Math.floor(Math.random() * COVER_IMAGES.length);
  return COVER_IMAGES[index]!;
}

/**
 * A custom React hook that returns a random cover image on component mount.
 * This avoids Next.js hydration mismatches by returning a default value on the server
 * and updating to a random selection on the client side after hydration.
 * @param defaultCover - The cover image returned before the client-side random image is selected.
 */
export function useRandomCoverImage(defaultCover: string = '/cover1.png'): string {
  const [cover, setCover] = useState<string>(defaultCover);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCover(getRandomCoverImage());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return cover;
}
