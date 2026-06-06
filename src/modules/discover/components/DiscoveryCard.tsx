'use client';

import type { DiscoverFeedItem } from '@/modules/discover/types/discover-ui.types';
import Image from 'next/image';
import { cn } from '@/modules/common/components/ui/cn';
import { MapPinIcon, PlusIcon } from '@/modules/common/icons';

type DiscoveryCardProps = {
  item: DiscoverFeedItem;
  isHovered?: boolean;
  isSelected?: boolean;
  onHover?: (itemId: string | null) => void;
  onSelect: (itemId: string) => void;
};

function CreatorAvatar(props: { imageUrl?: string; name: string }) {
  const { imageUrl, name } = props;

  if (imageUrl) {
    return (
      <Image
        alt={name}
        className="discover-card-avatar h-9 w-9 rounded-full object-cover ring-1"
        height={36}
        src={imageUrl}
        unoptimized
        width={36}
      />
    );
  }

  return (
    <div className="discover-card-avatar flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ring-1">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export const DiscoveryCard = (props: DiscoveryCardProps) => {
  const { isHovered = false, isSelected = false, item, onHover, onSelect } = props;

  return (
    <button
      className={cn(
        'discover-card group w-full overflow-hidden rounded-[28px] border text-left transition-all duration-200',
        'hover:-translate-y-0.5',
        isSelected && 'discover-card-selected',
        isHovered && !isSelected && 'discover-card-hovered',
      )}
      type="button"
      onBlur={() => onHover?.(null)}
      onClick={() => onSelect(item.id)}
      onMouseEnter={() => onHover?.(item.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="discover-card-media relative aspect-[1.18/1] overflow-hidden">
        {item.imageUrl
          ? (
              <Image
                alt={item.title}
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                src={item.imageUrl}
                unoptimized
              />
            )
          : (
              <div className="discover-card-empty-media absolute inset-0" />
            )}

        <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
        <div className="discover-card-type-badge absolute top-3 left-3 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase backdrop-blur-md">
          {item.type === 'journey' ? 'Journey' : 'Post'}
        </div>
        <div className="absolute right-3 bottom-3 left-3">
          <div className="rounded-2xl bg-white/14 px-3 py-2 text-white ring-1 ring-white/15 backdrop-blur-md">
            <p className="truncate text-sm font-semibold tracking-[-0.01em]">{item.title}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs leading-snug text-white/90">
              <MapPinIcon
                aria-hidden
                className="shrink-0 text-white/95"
                size={14}
                strokeWidth={2.25}
              />
              <span className="min-w-0 flex-1 truncate">{item.locationLabel}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4 pb-4">
        <div className="space-y-1">
          {item.subtitle
            ? (
                <p className="discover-card-muted line-clamp-2 text-sm leading-5">{item.subtitle}</p>
              )
            : null}
        </div>

        <div className="discover-card-divider flex items-start gap-3 border-t pt-4">
          <CreatorAvatar imageUrl={item.creator.avatarUrl} name={item.creator.name} />
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="discover-card-title truncate text-sm font-semibold">
              {item.creator.name}
            </p>
            <p className="discover-card-muted truncate text-xs">
              Shared a real-world
              {' '}
              {item.type}
              {' '}
              in
              {' '}
              {item.locationLabel}
            </p>
          </div>
          <div className="discover-card-action-badge ml-auto shrink-0 self-center rounded-full px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase">
            Explore
          </div>
        </div>

        {item.tags.length > 0
          ? (
              <div className="flex flex-wrap gap-2">
                {item.tags.map(tag => (
                  <span
                    key={tag}
                    className="discover-card-tag rounded-full border px-2.5 py-1 text-[11px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )
          : (
              <div className="flex flex-wrap gap-2">
                <span className="discover-card-tag rounded-full border px-2.5 py-1 text-[11px] font-medium">
                  Real experience
                </span>
                <span className="discover-card-tag rounded-full border px-2.5 py-1 text-[11px] font-medium">
                  Map discovery
                </span>
              </div>
            )}

        <div className="discover-card-divider flex items-center justify-between gap-3 border-t pt-3">
          <div className="min-w-0">
            <p className="discover-card-overline text-[11px] font-medium tracking-[0.12em] uppercase">
              Open journey
            </p>
            <p className="discover-card-title mt-0.5 text-sm font-semibold">See route and places</p>
          </div>
          <div className="discover-card-cta flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-[0_10px_24px_rgba(22,14,83,0.22)] transition-transform duration-200 group-hover:translate-x-0.5">
            <PlusIcon aria-hidden className="text-white" size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </button>
  );
};
