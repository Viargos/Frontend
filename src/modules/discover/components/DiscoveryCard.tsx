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
        className="h-9 w-9 rounded-full object-cover ring-1 ring-black/5"
        height={36}
        src={imageUrl}
        unoptimized
        width={36}
      />
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#160E53] text-xs font-semibold text-white ring-1 ring-black/5">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export const DiscoveryCard = (props: DiscoveryCardProps) => {
  const {
    isHovered = false,
    isSelected = false,
    item,
    onHover,
    onSelect,
  } = props;

  return (
    <button
      className={cn(
        'group w-full overflow-hidden rounded-[28px] border border-white/70 bg-white/96 text-left shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(15,23,42,0.12)]',
        isSelected && 'border-[#160E53]/10 ring-2 ring-[#160E53]/12 shadow-[0_24px_56px_rgba(22,14,83,0.16)]',
        isHovered && !isSelected && 'border-[#160E53]/8 ring-1 ring-[#160E53]/8',
      )}
      type="button"
      onBlur={() => onHover?.(null)}
      onClick={() => onSelect(item.id)}
      onMouseEnter={() => onHover?.(item.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="relative aspect-[1.18/1] overflow-hidden bg-linear-to-br from-[#160E53]/15 via-[#a5d8e4]/20 to-white">
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(22,14,83,0.22),transparent_38%),linear-gradient(135deg,rgba(22,14,83,0.12),rgba(8,145,178,0.18),rgba(255,255,255,0.65))]" />
            )}

        <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-[#160E53] uppercase backdrop-blur-md">
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
            ? <p className="line-clamp-2 text-sm leading-5 text-gray-500">{item.subtitle}</p>
            : null}
        </div>

        <div className="flex items-start gap-3 border-t border-black/5 pt-4">
          <CreatorAvatar imageUrl={item.creator.avatarUrl} name={item.creator.name} />
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-sm font-semibold text-gray-900">{item.creator.name}</p>
            <p className="truncate text-xs text-gray-500">
              Shared a real-world
              {' '}
              {item.type}
              {' '}
              in
              {' '}
              {item.locationLabel}
            </p>
          </div>
          <div className="ml-auto shrink-0 self-center rounded-full bg-[#160E53]/6 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-[#160E53] uppercase">
            Explore
          </div>
        </div>

        {item.tags.length > 0
          ? (
              <div className="flex flex-wrap gap-2">
                {item.tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#160E53]/8 bg-[#160E53]/4 px-2.5 py-1 text-[11px] font-medium text-[#160E53]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )
          : (
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-black/6 bg-black/2 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                  Real experience
                </span>
                <span className="rounded-full border border-black/6 bg-black/2 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                  Map discovery
                </span>
              </div>
            )}

        <div className="flex items-center justify-between gap-3 border-t border-black/5 pt-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.12em] text-gray-400 uppercase">Open journey</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">See route and places</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#160E53] text-white shadow-[0_10px_24px_rgba(22,14,83,0.22)] transition-transform duration-200 group-hover:translate-x-0.5">
            <PlusIcon aria-hidden className="text-white" size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </button>
  );
};
