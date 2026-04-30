'use client';

import { create } from 'zustand';

type DiscoverBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

type DiscoverViewMode = 'split' | 'map-focus' | 'feed-focus';

type DiscoverStore = {
  hoveredItemId: string | null;
  selectedItemId: string | null;
  visibleFeedItemIds: string[];
  bounds: DiscoverBounds | null;
  searchAreaDirty: boolean;
  viewMode: DiscoverViewMode;
  isBottomSheetOpen: boolean;
  setHoveredItemId: (hoveredItemId: string | null) => void;
  setSelectedItemId: (selectedItemId: string | null) => void;
  setVisibleFeedItemIds: (visibleFeedItemIds: string[]) => void;
  setBounds: (bounds: DiscoverBounds | null) => void;
  setSearchAreaDirty: (searchAreaDirty: boolean) => void;
  setViewMode: (viewMode: DiscoverViewMode) => void;
  setBottomSheetOpen: (isBottomSheetOpen: boolean) => void;
  resetInteractionState: () => void;
};

const DEFAULT_DISCOVER_VIEW_MODE: DiscoverViewMode = 'split';

export const useDiscoverStore = create<DiscoverStore>(set => ({
  bounds: null,
  hoveredItemId: null,
  isBottomSheetOpen: false,
  searchAreaDirty: false,
  selectedItemId: null,
  setBottomSheetOpen: isBottomSheetOpen => set({ isBottomSheetOpen }),
  setBounds: bounds => set({ bounds }),
  setHoveredItemId: hoveredItemId => set({ hoveredItemId }),
  setSearchAreaDirty: searchAreaDirty => set({ searchAreaDirty }),
  setSelectedItemId: selectedItemId => set({ selectedItemId }),
  setViewMode: viewMode => set({ viewMode }),
  setVisibleFeedItemIds: visibleFeedItemIds => set({ visibleFeedItemIds }),
  resetInteractionState: () => set({
    hoveredItemId: null,
    searchAreaDirty: false,
    selectedItemId: null,
    visibleFeedItemIds: [],
  }),
  viewMode: DEFAULT_DISCOVER_VIEW_MODE,
  visibleFeedItemIds: [],
}));

export type { DiscoverBounds, DiscoverStore, DiscoverViewMode };
