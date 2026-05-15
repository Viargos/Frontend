'use client';

import type { MouseEvent, PointerEvent } from 'react';
import type { DiscoverFeedItem } from '@/modules/discover/types/discover-ui.types';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/modules/common/components/ui/cn';
import { MapPinIcon } from '@/modules/common/icons';

type FloatingPreviewProps = {
  item: DiscoverFeedItem | null;
  onOpenDetails?: (itemId: string) => void;
  variant?: 'floating' | 'inline';
};

export const FloatingPreview = (props: FloatingPreviewProps) => {
  const { item, onOpenDetails, variant = 'floating' } = props;

  if (!item) {
    return null;
  }

  const journeyHref = `/journey/${item.journeyId ?? item.id}`;
  const isInline = variant === 'inline';
  const previewLabel = item.type === 'journey' ? 'Journey preview' : 'Post preview';

  const stopMapCapture = (event: MouseEvent | PointerEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      className={cn(
        'pointer-events-auto overflow-hidden rounded-2xl bg-white',
        isInline
          ? cn(
              'w-[min(22.5rem,calc(100vw-2rem))] border border-neutral-200/85',
              'shadow-[0_20px_50px_-12px_rgba(15,23,42,0.28),0_0_0_1px_rgba(15,23,42,0.06)]',
            )
          : cn(
              'absolute right-4 bottom-4 left-4 z-10 max-w-md border border-neutral-200/90 lg:left-6',
              'shadow-[0_16px_48px_-12px_rgba(15,23,42,0.22),0_0_0_1px_rgba(15,23,42,0.04)]',
            ),
      )}
    >
      <div className={cn(isInline ? 'p-4' : 'p-3.5 sm:p-4')}>
        <div className={cn('flex justify-end', isInline ? 'mb-3' : 'mb-2')}>
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
            {previewLabel}
          </span>
        </div>

        <div className="flex gap-3.5">
          <div
            className={cn(
              'relative h-23 w-23 shrink-0 overflow-hidden rounded-2xl',
              'bg-neutral-100 ring-1 ring-black/6',
            )}
          >
            {item.imageUrl
              ? (
                  <Image
                    alt={item.title}
                    className="object-cover"
                    fill
                    sizes="92px"
                    src={item.imageUrl}
                    unoptimized
                  />
                )
              : (
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(145deg,rgba(22,14,83,0.08)_0%,rgba(8,145,178,0.12)_45%,rgba(255,255,255,0.9)_100%)]"
                  />
                )}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="line-clamp-2 text-[1.0625rem] leading-snug font-semibold tracking-[-0.02em] text-neutral-900">
              {item.title}
            </h3>
            <p className="mt-1.5 flex items-start gap-1.5 text-[0.8125rem] leading-snug text-neutral-500">
              <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#160E53]/55" />
              <span className="line-clamp-2">{item.locationLabel}</span>
            </p>
            {item.subtitle
              ? (
                  <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed text-neutral-600">
                    {item.subtitle}
                  </p>
                )
              : null}

            {item.tags.length > 0
              ? (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="rounded-md bg-neutral-100/90 px-2 py-0.5 text-[11px] font-medium text-neutral-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )
              : null}
          </div>
        </div>

        <div className="mt-4 border-t border-neutral-100 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <Link
              className={cn(
                'inline-flex min-h-10 items-center justify-center rounded-xl px-3 text-center text-[0.8125rem] font-semibold text-white',
                'bg-[#160E53] shadow-sm transition-colors hover:bg-[#120a45] active:bg-[#0f0838]',
              )}
              href={journeyHref}
              onClick={stopMapCapture}
              onPointerDown={stopMapCapture}
            >
              Go to journey
            </Link>
            <button
              className={cn(
                'inline-flex min-h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 text-center text-[0.8125rem] font-semibold text-neutral-800',
                'transition-colors hover:border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100',
              )}
              type="button"
              onClick={(event) => {
                stopMapCapture(event);
                onOpenDetails?.(item.id);
              }}
              onPointerDown={stopMapCapture}
            >
              Quick preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
