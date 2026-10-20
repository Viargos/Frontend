'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuthSession } from '@/modules/auth';
import { OverlayModal } from '@/modules/common/components/OverlayModal';
import { EditProfileModal } from '@/modules/settings/components/EditProfileModal';
import { SettingsCategoryContent } from '@/modules/settings/components/SettingsCategoryContent';
import { SettingsCategoryNavigation } from '@/modules/settings/components/SettingsCategoryNavigation';
import { SETTINGS_CATEGORIES, SETTINGS_COPY } from '@/modules/settings/constants/settings-copy';

export function SettingsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signOut } = useAuthSession();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const navigationRef = useRef<HTMLElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const selectedCategory = SETTINGS_CATEGORIES.find(category => category.id === searchParams.get('category'));
  const category = selectedCategory ?? SETTINGS_CATEGORIES[0];
  const previousCategoryRef = useRef(selectedCategory);

  useEffect(() => {
    if (new URL(document.URL).hash === '#theme-background-selector' && !searchParams.has('category')) {
      router.replace('/settings?category=display#theme-background-selector', { scroll: false });
    }
  }, [router, searchParams]);

  useEffect(() => {
    detailRef.current?.scrollTo({ top: 0 });
    if (selectedCategory) {
      headingRef.current?.focus({ preventScroll: true });
    } else if (previousCategoryRef.current) {
      navigationRef.current?.querySelector<HTMLAnchorElement>(`a[href="/settings?category=${previousCategoryRef.current.id}"]`)?.focus({ preventScroll: true });
    }
    previousCategoryRef.current = selectedCategory;
  }, [selectedCategory]);

  return (
    <div className="flex h-[calc(100dvh-5rem)] min-h-0 w-full overflow-hidden bg-[var(--surface-0)] sm:h-dvh" data-settings-layout>
      <aside ref={navigationRef} className={`${selectedCategory ? 'hidden md:flex' : 'flex'} h-full min-h-0 w-full shrink-0 flex-col border-r border-[var(--border-subtle)] md:w-80 xl:w-[400px]`}>
        <SettingsCategoryNavigation selectedCategory={category.id} />
      </aside>
      <section aria-labelledby="settings-category-heading" className={`${selectedCategory ? 'flex' : 'hidden md:flex'} h-full min-h-0 min-w-0 flex-1 flex-col`}>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--border-subtle)] px-5">
          <Link
            aria-label={SETTINGS_COPY.back}
            className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-primary)] hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)] md:hidden"
            href="/settings"
            scroll={false}
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
          </Link>
          <h2 ref={headingRef} className="text-xl font-bold tracking-tight text-[var(--text-primary)] outline-none" id="settings-category-heading" tabIndex={-1}>{category.label}</h2>
        </header>
        <div ref={detailRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8" data-settings-detail-scroll>
          <p className="px-5 py-5 text-sm leading-6 text-[var(--text-muted)]">{category.description}</p>
          <SettingsCategoryContent category={category.id} onEditProfile={() => setIsEditProfileOpen(true)} onLogout={() => setIsLogoutOpen(true)} />
        </div>
      </section>
      {isLogoutOpen && (
        <OverlayModal ariaLabel={SETTINGS_COPY.logout} className="max-w-md p-6" onClose={() => setIsLogoutOpen(false)}>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">{SETTINGS_COPY.logout}</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{SETTINGS_COPY.logoutConfirmation}</p>
          <div className="mt-6 flex justify-end gap-3">
            <button className="rounded-full border border-[var(--border-subtle)] px-5 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]" type="button" onClick={() => setIsLogoutOpen(false)}>{SETTINGS_COPY.cancel}</button>
            <button
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              type="button"
              onClick={async () => {
                setIsLogoutOpen(false);
                await signOut();
                router.push('/');
              }}
            >
              {SETTINGS_COPY.logout}
            </button>
          </div>
        </OverlayModal>
      )}
      {isEditProfileOpen && <EditProfileModal onClose={() => setIsEditProfileOpen(false)} />}
    </div>
  );
}
