'use client';

import type { SettingsCategoryId } from '@/modules/settings/constants/settings-copy';
import { ChevronRight, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { SETTINGS_CATEGORIES, SETTINGS_COPY } from '@/modules/settings/constants/settings-copy';

export function SettingsCategoryNavigation(props: { selectedCategory: SettingsCategoryId }) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLocaleLowerCase();
  const categories = SETTINGS_CATEGORIES.filter(category =>
    [category.label, ...category.searchTerms].some(term => term.toLocaleLowerCase().includes(query)),
  );

  return (
    <>
      <header className="flex h-16 shrink-0 items-center px-5">
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">{SETTINGS_COPY.title}</h1>
      </header>
      <div className="px-4 pb-4">
        <div className="flex h-11 items-center gap-2 rounded-full border border-[var(--border-subtle)] px-3 text-[var(--text-muted)] focus-within:border-[var(--text-primary)] focus-within:ring-1 focus-within:ring-[var(--text-primary)]">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0" />
          <input
            aria-label={SETTINGS_COPY.search}
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            placeholder={SETTINGS_COPY.search}
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
          {search && (
            <button
              aria-label={SETTINGS_COPY.clearSearch}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
              type="button"
              onClick={() => setSearch('')}
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <nav aria-label={SETTINGS_COPY.navigation} className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6">
        {categories.map((category) => {
          const selected = props.selectedCategory === category.id;
          const matchingTerm = query ? category.searchTerms.find(term => term.toLocaleLowerCase().includes(query)) : undefined;

          return (
            <Link
              key={category.id}
              aria-current={selected ? 'page' : undefined}
              className={`flex min-h-14 items-center justify-between gap-3 border-r-[3px] px-5 py-4 text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--text-primary)] motion-reduce:transition-none ${selected
                ? 'border-[var(--surface-inverse)] bg-[var(--surface-1)] font-semibold text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'}`}
              href={`/settings?category=${category.id}`}
              scroll={false}
            >
              <span className="min-w-0">
                <span className="block">{category.label}</span>
                {matchingTerm && <span className="mt-1 block text-xs font-normal text-[var(--text-muted)]">{matchingTerm}</span>}
              </span>
              <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            </Link>
          );
        })}
        {categories.length === 0 && (
          <div className="px-5 py-8" role="status">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{SETTINGS_COPY.noResults}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{SETTINGS_COPY.noResultsDescription}</p>
          </div>
        )}
      </nav>
    </>
  );
}
