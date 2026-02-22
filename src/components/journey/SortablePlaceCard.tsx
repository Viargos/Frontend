'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CreateJourneyPlace } from '@/types/journey.types';
import { PlaceCard } from './PlaceCard';
import type { DragHandleProps } from './PlaceCard';

interface SortablePlaceCardProps {
  place: CreateJourneyPlace;
  index: number;
  dayKey: string;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onRemove: () => void;
  onUpdateField: (field: keyof CreateJourneyPlace, value: string | number) => void;
  onAddPhoto: (photoKey: string) => void;
  onRemovePhoto: (photoIndex: number) => void;
}

export function SortablePlaceCard({
  place,
  index,
  dayKey,
  isExpanded,
  onToggleExpansion,
  onRemove,
  onUpdateField,
  onAddPhoto,
  onRemovePhoto,
}: SortablePlaceCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: place.id });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragHandleProps: DragHandleProps = { listeners, attributes };

  return (
    <div ref={setNodeRef} style={style}>
      <PlaceCard
        place={place}
        index={index}
        dayKey={dayKey}
        isExpanded={isExpanded}
        onToggleExpansion={onToggleExpansion}
        onRemove={onRemove}
        onUpdateField={onUpdateField}
        onAddPhoto={onAddPhoto}
        onRemovePhoto={onRemovePhoto}
        dragHandleProps={dragHandleProps}
      />
    </div>
  );
}
