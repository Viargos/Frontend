'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarIcon,
  ChevronDownIcon,
  JourneyIcon,
  SearchIcon,
  XIcon,
} from '@/modules/common/icons';

// ─── Types ────────────────────────────────────────────────────────────────────

export type JourneyOption = {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  createdAt: string;
};

type JourneyDropdownProps = {
  disabled?: boolean;
  id?: string;
  journeys: JourneyOption[];
  onChange: (id: string) => void;
  value: string;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

type JourneyThumbnailProps = {
  journey: JourneyOption;
  size?: 'sm' | 'md';
  highlighted?: boolean;
};

function JourneyThumbnail({ journey, size = 'md', highlighted = false }: JourneyThumbnailProps) {
  const dimensions = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-4 w-4';
  const radius = size === 'sm' ? 'rounded-md' : 'rounded-lg';

  if (journey.coverImage) {
    return (
      <div className={`relative ${dimensions} flex-shrink-0 overflow-hidden ${radius}`}>
        <Image
          alt={journey.title}
          className="object-cover"
          fill
          sizes={size === 'sm' ? '28px' : '36px'}
          src={journey.coverImage}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`flex ${dimensions} flex-shrink-0 items-center justify-center ${radius} ${
        highlighted ? 'bg-indigo-100' : 'bg-gray-100'
      }`}
    >
      <JourneyIcon
        className={`${iconSize} ${highlighted ? 'text-[#160E53]' : 'text-gray-400'}`}
      />
    </div>
  );
}

type JourneyOptionItemProps = {
  journey: JourneyOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

function JourneyOptionItem({ journey, isSelected, onSelect }: JourneyOptionItemProps) {
  return (
    <li>
      <button
        aria-selected={isSelected}
        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
          isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'
        }`}
        role="option"
        type="button"
        onClick={() => onSelect(journey.id)}
      >
        <JourneyThumbnail highlighted={isSelected} journey={journey} />

        <div className="min-w-0 flex-1">
          <p className={`truncate font-medium ${isSelected ? 'text-[#160E53]' : 'text-gray-900'}`}>
            {journey.title}
          </p>
          {journey.description
            ? (
                <p className="truncate text-xs text-gray-400">{journey.description}</p>
              )
            : (
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <CalendarIcon className="h-3 w-3" />
                  {new Date(journey.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              )}
        </div>

        {isSelected && (
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#160E53]">
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              viewBox="0 0 24 24"
            >
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </button>
    </li>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function JourneyDropdown({ disabled, id, journeys, onChange, value }: JourneyDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = journeys.find(j => j.id === value);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return journeys;
    }

    return journeys.filter(
      j =>
        j.title.toLowerCase().includes(term)
        || j.description.toLowerCase().includes(term),
    );
  }, [journeys, query]);

  function clearFocusTimeout() {
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }
  }

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        clearFocusTimeout();
        setOpen(false);
        setQuery('');
      }
    }

    document.addEventListener('mousedown', onMouseDown);

    return () => {
      clearFocusTimeout();
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  function handleOpen() {
    clearFocusTimeout();
    setOpen(true);
    focusTimeoutRef.current = setTimeout(() => {
      searchRef.current?.focus();
      focusTimeoutRef.current = null;
    }, 50);
  }

  function handleClose() {
    clearFocusTimeout();
    setOpen(false);
    setQuery('');
  }

  function handleSelect(id: string) {
    onChange(id);
    handleClose();
  }

  function handleClearSelection() {
    onChange('');
    handleClose();
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className={[
          'flex h-11 w-full items-center gap-3 rounded-lg border px-3 text-left text-sm transition-all outline-none',
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-50'
            : 'cursor-pointer bg-white hover:border-[#160E53]/40',
          open ? 'border-primary-blue ring-1 ring-primary-blue/30' : 'border-gray-300',
        ].join(' ')}
        disabled={disabled}
        id={id}
        type="button"
        onClick={() => (open ? handleClose() : handleOpen())}
      >
        {selected
          ? <JourneyThumbnail highlighted journey={selected} size="sm" />
          : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100">
                <JourneyIcon className="h-4 w-4 text-gray-400" />
              </div>
            )}

        <span className={`flex-1 truncate ${selected ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
          {selected ? selected.title : 'Search or select a journey…'}
        </span>

        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
            exit={{ opacity: 0, y: -4 }}
            initial={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {/* Search input */}
            <div className="border-b border-gray-100 px-3 py-2.5">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5">
                <SearchIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <input
                  ref={searchRef}
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
                  placeholder="Search journeys…"
                  type="text"
                  value={query}
                  style={{ outline: 'none', boxShadow: 'none', border: 'none' }}
                  onChange={e => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    aria-label="Clear search"
                    className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600"
                    type="button"
                    onClick={() => setQuery('')}
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Options list */}
            <ul
              className="max-h-52 overflow-y-auto py-1"
              role="listbox"
            >
              {/* Clear selection row (only when something is selected) */}
              {selected && (
                <li>
                  <button
                    aria-selected={false}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-400 hover:bg-gray-50"
                    role="option"
                    type="button"
                    onClick={handleClearSelection}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100">
                      <XIcon className="h-3.5 w-3.5 text-gray-300" />
                    </div>
                    <span className="italic">Clear selection</span>
                  </button>
                </li>
              )}

              {filtered.length > 0
                ? filtered.map(journey => (
                    <JourneyOptionItem
                      key={journey.id}
                      isSelected={journey.id === value}
                      journey={journey}
                      onSelect={handleSelect}
                    />
                  ))
                : (
                    <li className="flex flex-col items-center gap-1 px-3 py-6 text-center text-sm text-gray-400">
                      <SearchIcon className="h-5 w-5 text-gray-300" />
                      <span>
                        No journeys match &ldquo;
                        {query}
                        &rdquo;
                      </span>
                    </li>
                  )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
