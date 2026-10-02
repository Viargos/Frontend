'use client';

import type { PropsWithChildren } from 'react';
import type { ThemeBackgroundId } from '@/modules/common/constants';
import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';
import {
  getThemeBackground,
  THEME_BACKGROUND_AUTO_ROTATE_STORAGE_KEY,
  THEME_BACKGROUND_STORAGE_KEY,
  THEME_BACKGROUNDS,
} from '@/modules/common/constants';
import { ThemeBackgroundContext } from './theme-background-context';

const AUTO_ROTATE_DELAY_SECONDS = 8;

function preloadBackground(src: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Unable to load theme background: ${src}`));
    image.src = src;
  });
}

function preloadAllBackgrounds() {
  return Promise.all(THEME_BACKGROUNDS.map(background => preloadBackground(background.src)));
}

function getNextBackgroundId(currentBackgroundId: ThemeBackgroundId | null) {
  const currentIndex = THEME_BACKGROUNDS.findIndex(background => background.id === currentBackgroundId);
  const nextIndex = currentIndex < 0 || currentIndex === THEME_BACKGROUNDS.length - 1
    ? 0
    : currentIndex + 1;

  return THEME_BACKGROUNDS[nextIndex]?.id ?? THEME_BACKGROUNDS[0].id;
}

export function ThemeBackgroundProvider(props: PropsWithChildren) {
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<ThemeBackgroundId | null>(null);
  const [pendingBackgroundId, setPendingBackgroundId] = useState<ThemeBackgroundId | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isAutoRotateLoading, setIsAutoRotateLoading] = useState(false);
  const requestIdRef = useRef(0);
  const selectedBackground = getThemeBackground(selectedBackgroundId);

  useEffect(() => {
    const storedBackgroundId = window.localStorage.getItem(THEME_BACKGROUND_STORAGE_KEY);
    const storedBackground = getThemeBackground(storedBackgroundId);
    const shouldAutoRotate
      = window.localStorage.getItem(THEME_BACKGROUND_AUTO_ROTATE_STORAGE_KEY) === 'true';

    if (!storedBackground && !shouldAutoRotate) {
      if (storedBackgroundId) {
        window.localStorage.removeItem(THEME_BACKGROUND_STORAGE_KEY);
      }
      return;
    }

    const initialBackground = storedBackground ?? THEME_BACKGROUNDS[0];
    const requestId = ++requestIdRef.current;
    const preloadRequest = shouldAutoRotate
      ? preloadAllBackgrounds()
      : preloadBackground(initialBackground.src);

    void preloadRequest
      .then(() => {
        if (requestId === requestIdRef.current) {
          window.localStorage.setItem(THEME_BACKGROUND_STORAGE_KEY, initialBackground.id);
          setSelectedBackgroundId(initialBackground.id);
          setIsAutoRotating(shouldAutoRotate);
        }
      })
      .catch(() => {
        window.localStorage.removeItem(THEME_BACKGROUND_STORAGE_KEY);
        window.localStorage.removeItem(THEME_BACKGROUND_AUTO_ROTATE_STORAGE_KEY);
      });
  }, []);

  useEffect(() => {
    if (!isAutoRotating) {
      return;
    }

    const rotationCall = gsap.delayedCall(AUTO_ROTATE_DELAY_SECONDS, () => {
      setSelectedBackgroundId((currentBackgroundId) => {
        const nextBackgroundId = getNextBackgroundId(currentBackgroundId);
        window.localStorage.setItem(THEME_BACKGROUND_STORAGE_KEY, nextBackgroundId);
        return nextBackgroundId;
      });
    });

    return () => {
      rotationCall.kill();
    };
  }, [isAutoRotating, selectedBackgroundId]);

  const disableAutoRotation = () => {
    requestIdRef.current += 1;
    window.localStorage.removeItem(THEME_BACKGROUND_AUTO_ROTATE_STORAGE_KEY);
    setIsAutoRotateLoading(false);
    setIsAutoRotating(false);
  };

  const enableAutoRotation = async () => {
    const requestId = ++requestIdRef.current;
    setIsAutoRotateLoading(true);

    try {
      await preloadAllBackgrounds();

      if (requestId !== requestIdRef.current) {
        return false;
      }

      const initialBackgroundId = selectedBackgroundId ?? THEME_BACKGROUNDS[0].id;
      window.localStorage.setItem(THEME_BACKGROUND_STORAGE_KEY, initialBackgroundId);
      window.localStorage.setItem(THEME_BACKGROUND_AUTO_ROTATE_STORAGE_KEY, 'true');
      setSelectedBackgroundId(initialBackgroundId);
      setIsAutoRotating(true);
      return true;
    } catch {
      return false;
    } finally {
      if (requestId === requestIdRef.current) {
        setIsAutoRotateLoading(false);
      }
    }
  };

  const selectBackground = async (backgroundId: ThemeBackgroundId) => {
    const background = getThemeBackground(backgroundId);

    if (!background) {
      return false;
    }

    const requestId = ++requestIdRef.current;
    setPendingBackgroundId(backgroundId);

    try {
      await preloadBackground(background.src);

      if (requestId !== requestIdRef.current) {
        return false;
      }

      window.localStorage.removeItem(THEME_BACKGROUND_AUTO_ROTATE_STORAGE_KEY);
      window.localStorage.setItem(THEME_BACKGROUND_STORAGE_KEY, backgroundId);
      setIsAutoRotating(false);
      setSelectedBackgroundId(backgroundId);
      return true;
    } catch {
      return false;
    } finally {
      if (requestId === requestIdRef.current) {
        setPendingBackgroundId(null);
      }
    }
  };

  const removeBackground = () => {
    requestIdRef.current += 1;
    window.localStorage.removeItem(THEME_BACKGROUND_AUTO_ROTATE_STORAGE_KEY);
    window.localStorage.removeItem(THEME_BACKGROUND_STORAGE_KEY);
    setIsAutoRotateLoading(false);
    setIsAutoRotating(false);
    setPendingBackgroundId(null);
    setSelectedBackgroundId(null);
  };

  return (
    <ThemeBackgroundContext
      value={{
        disableAutoRotation,
        enableAutoRotation,
        isAutoRotateLoading,
        isAutoRotating,
        pendingBackgroundId,
        removeBackground,
        selectedBackground,
        selectBackground,
      }}
    >
      {props.children}
    </ThemeBackgroundContext>
  );
}
