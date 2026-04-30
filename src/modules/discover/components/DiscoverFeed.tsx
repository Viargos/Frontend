'use client';

import type { DiscoverFeedItem } from '@/modules/discover/types/discover-ui.types';
import { DiscoveryCard } from '@/modules/discover/components/DiscoveryCard';

type DiscoverFeedProps = {
  emptyMessage?: string;
  hoveredItemId: string | null;
  items: DiscoverFeedItem[];
  selectedItemId: string | null;
  onItemHover: (itemId: string | null) => void;
  onItemSelect: (itemId: string) => void;
};

export const DiscoverFeed = (props: DiscoverFeedProps) => {
  const {
    emptyMessage = 'No places are available in this area yet.',
    hoveredItemId,
    items,
    selectedItemId,
    onItemHover,
    onItemSelect,
  } = props;

  if (items.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {items.map(item => (
        <DiscoveryCard
          key={item.id}
          isHovered={hoveredItemId === item.id}
          isSelected={selectedItemId === item.id}
          item={item}
          onHover={onItemHover}
          onSelect={onItemSelect}
        />
      ))}
    </div>
  );
};
