'use client';

import { XIcon } from '@/modules/common/icons';

type DiscoverFilterChip = {
  id: string;
  label: string;
  onRemove: () => void;
};

type DiscoverFilterChipsProps = {
  chips: DiscoverFilterChip[];
};

export const DiscoverFilterChips = (props: DiscoverFilterChipsProps) => {
  const { chips } = props;

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {chips.map(chip => (
        <button
          key={chip.id}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#160E53]/8 px-3 py-1.5 text-xs font-medium text-[#160E53] transition-colors hover:bg-[#160E53]/12"
          type="button"
          onClick={chip.onRemove}
        >
          <span>{chip.label}</span>
          <XIcon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
};
