'use client';

import type { CSSProperties } from 'react';
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
import { cn } from '@/modules/common/components/ui/cn';
import { useThemeBackground } from '@/modules/common/hooks/use-theme-background';

const backgroundLayerStyle: CSSProperties = {
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

export function ThemeBackgroundSurface(props: {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  viewportPinned?: boolean;
}) {
  const { selectedBackground } = useThemeBackground();
  const firstLayerRef = useRef<HTMLDivElement | null>(null);
  const secondLayerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const activeLayerIndexRef = useRef(0);

  useEffect(() => {
    const layers = [firstLayerRef.current, secondLayerRef.current];
    const overlay = overlayRef.current;
    const activeLayer = layers[activeLayerIndexRef.current];

    if (!activeLayer || !overlay) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion ? 0 : 0.65;
    gsap.killTweensOf([...layers, overlay]);

    if (!selectedBackground) {
      const resetTimeline = gsap.timeline();
      resetTimeline
        .to(activeLayer, { autoAlpha: 0, duration, ease: 'power2.inOut' })
        .to(overlay, { opacity: 0, duration, ease: 'power2.inOut' }, '<');

      return () => {
        resetTimeline.kill();
      };
    }

    const nextLayerIndex = activeLayerIndexRef.current === 0 ? 1 : 0;
    const nextLayer = layers[nextLayerIndex];

    if (!nextLayer) {
      return;
    }

    const presentation = 'backgroundPresentation' in selectedBackground
      ? selectedBackground.backgroundPresentation
      : backgroundLayerStyle;

    nextLayer.style.backgroundImage = `url("${selectedBackground.src}")`;
    Object.assign(nextLayer.style, backgroundLayerStyle, presentation);
    gsap.set(nextLayer, { autoAlpha: 0 });

    const crossfadeTimeline = gsap.timeline({
      onComplete: () => {
        activeLayer.style.backgroundImage = '';
        activeLayerIndexRef.current = nextLayerIndex;
      },
    });

    crossfadeTimeline
      .to(nextLayer, { autoAlpha: 1, duration, ease: 'power2.inOut' })
      .to(activeLayer, { autoAlpha: 0, duration, ease: 'power2.inOut' }, '<')
      .to(overlay, {
        duration,
        ease: 'power2.inOut',
        opacity: selectedBackground.overlayOpacity,
      }, '<');

    return () => {
      crossfadeTimeline.kill();
    };
  }, [selectedBackground]);

  return (
    <div
      className={cn(
        'relative isolate bg-white transition-colors dark:bg-black',
        !props.viewportPinned && 'overflow-hidden',
        props.className,
      )}
      data-custom-background={selectedBackground ? 'true' : undefined}
    >
      <div
        aria-hidden="true"
        className={props.viewportPinned
          ? 'pointer-events-none fixed inset-y-0 right-0 left-0 z-0 sm:left-16 lg:left-[272px]'
          : 'pointer-events-none absolute inset-0'}
      >
        <div ref={firstLayerRef} className="invisible absolute inset-0 opacity-0 will-change-[opacity]" style={backgroundLayerStyle} />
        <div ref={secondLayerRef} className="invisible absolute inset-0 opacity-0 will-change-[opacity]" style={backgroundLayerStyle} />
        <div ref={overlayRef} className="absolute inset-0 bg-black opacity-0 will-change-[opacity]" />
      </div>
      <div className={cn('relative z-10', props.contentClassName)}>{props.children}</div>
    </div>
  );
}
