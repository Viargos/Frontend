'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuthSession } from '@/modules/auth';
import { AddPostIcon, CreateJourneyIcon } from '@/modules/common/icons';
import { useUserSearch } from '@/modules/search';
import { BellIcon, SearchIcon, UserProfileIcon } from './dashboard-icons';
import { DashboardCreatePostModal } from './DashboardCreatePostModal';

const notifications: Array<{ id: string; message: string; read: boolean; time: string }> = [];

export const DashboardHeader = () => {
  const router = useRouter();
  const { session, signOut } = useAuthSession();
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const normalizedQuery = searchQuery.trim();
  const {
    isDebouncing,
    isFetching,
    isLoading,
    results,
  } = useUserSearch(searchQuery, { enabled: Boolean(session.user) });
  const shouldShowSearchResults = isSearchExpanded && showSearchResults && normalizedQuery.length >= 2;

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      if (!searchRef.current) {
        return;
      }

      const target = event.target;
      if (target instanceof Node && !searchRef.current.contains(target)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return;
      }

      setShowSearchResults(false);
      setIsSearchExpanded(false);
      setSearchQuery('');
    }

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSearchClear = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setIsSearchExpanded(false);
  };

  const handleSearchToggle = () => {
    if (isSearchExpanded) {
      handleSearchClear();
      return;
    }

    setIsSearchExpanded(true);
    setShowSearchResults(true);
  };

  const handleCreatePost = () => {
    setShowCreatePostModal(true);
  };

  const handleCreateJourney = () => {
    router.push('/create-journey');
  };

  return (
    <header className="flex w-full items-center justify-between gap-2 bg-white px-4 py-4 sm:gap-4">
      <div className="flex shrink-0 items-center">
        <button aria-label="Go to dashboard" className="flex cursor-pointer items-center justify-center text-lg font-bold text-white" type="button" onClick={() => router.push('/dashboard')}>
          <Image alt="viargos" className="block sm:hidden" height={40} src="/viargos.svg" width={40} />
          <Image alt="viargos" className="hidden sm:block" height={32} src="/viargos_full.svg" style={{ width: 'auto', height: 'auto' }} width={130} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div ref={searchRef} className={`relative transition-all duration-500 ease-in-out ${isSearchExpanded ? 'w-64 md:w-80' : 'w-10'}`}>
          {!isSearchExpanded
            ? (
                <button
                  aria-label="Search"
                  className="shadow-button flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#160E53] p-2 text-[#160E53] transition-all duration-200 hover:border-[#160E53] hover:bg-gray-100 hover:text-[#160E53]"
                  type="button"
                  onClick={handleSearchToggle}
                >
                  <SearchIcon className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                </button>
              )
            : (
                <div className={`transition-all delay-200 duration-300 ease-out ${isSearchExpanded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                  <input
                    className="shadow-button h-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 pl-10 text-sm leading-5 text-black placeholder-gray-500 transition-all duration-200 focus:border-[#160E53] focus:ring-2 focus:ring-[#160E53] focus:outline-none"
                    placeholder="Search users..."
                    type="text"
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setShowSearchResults(true);
                    }}
                    onFocus={() => setShowSearchResults(true)}
                  />

                  <SearchIcon className={`absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 transition-all delay-300 duration-300 ${isSearchExpanded ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`} />

                  <button
                    aria-label="Close search"
                    className={`absolute top-1/2 right-3 -translate-y-1/2 transform cursor-pointer rounded-full p-1 text-gray-400 transition-all duration-200 hover:scale-110 hover:bg-gray-100 hover:text-gray-600 ${isSearchExpanded ? 'scale-100 opacity-100 delay-400' : 'scale-75 opacity-0'}`}
                    type="button"
                    onClick={handleSearchClear}
                  >
                    ×
                  </button>
                </div>
              )}

          {shouldShowSearchResults
            ? (
                <div className="absolute top-full right-0 left-0 z-50 mt-2 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
                  {isDebouncing || isLoading || isFetching
                    ? (
                        <div className="py-4 text-center">
                          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#160E53]" />
                        </div>
                      )
                    : results.length === 0
                      ? (
                          <p className="text-center text-sm text-gray-500">No users found</p>
                        )
                      : (
                          <div className="max-h-60 overflow-y-auto">
                            {results.map(result => (
                              <button
                                key={result.id}
                                className="flex w-full items-center space-x-3 rounded-lg p-2 text-left transition-colors hover:bg-blue-50"
                                type="button"
                                onClick={() => {
                                  setShowSearchResults(false);
                                  setSearchQuery('');
                                  setIsSearchExpanded(false);
                                  router.push(`/user/${encodeURIComponent(result.id)}`);
                                }}
                              >
                                {result.profileImage
                                  ? (
                                      <Image
                                        alt={result.username}
                                        className="h-8 w-8 rounded-full object-cover"
                                        height={32}
                                        src={result.profileImage}
                                        unoptimized
                                        width={32}
                                      />
                                    )
                                  : (
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#160E53] text-sm font-medium text-white">
                                        {result.username.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-[#160E53]">
                                    {result.username}
                                  </p>
                                  <p className="truncate text-xs text-gray-500">
                                    @
                                    {result.username}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                </div>
              )
            : null}
        </div>

        <div className={`flex items-center gap-2 transition-all duration-300 ${isSearchExpanded ? 'max-[639px]:pointer-events-none max-[639px]:hidden max-[639px]:scale-95 max-[639px]:opacity-0 sm:pointer-events-auto sm:scale-100 sm:opacity-100' : 'pointer-events-auto scale-100 opacity-100'}`}>
          <button
            aria-label="Create Post"
            className="shadow-button border-primary-blue text-primary-blue inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border bg-white px-3.5 py-2 font-manrope text-sm leading-5 font-semibold transition-colors hover:bg-gray-50"
            type="button"
            onClick={handleCreatePost}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              <AddPostIcon size={20} className="text-primary-blue h-5 w-5" />
            </span>
            <span className="text-primary-blue hidden lg:inline">Add Post</span>
          </button>

          <button
            aria-label="Create Journey"
            className="shadow-button border-primary-blue text-primary-blue inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border bg-white px-3.5 py-2 font-manrope text-sm leading-5 font-semibold transition-colors hover:bg-gray-50"
            type="button"
            onClick={handleCreateJourney}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              <CreateJourneyIcon size={20} className="text-primary-blue h-5 w-5" />
            </span>
            <span className="text-primary-blue hidden lg:inline">Create Journey</span>
          </button>

          <div className="relative">
            <button aria-label="Open notifications" className="relative cursor-pointer p-2 text-[#160E53] transition-colors hover:text-[#160E53]" type="button" onClick={() => setShowNotifications(previous => !previous)}>
              <BellIcon className="h-6 w-6" />
            </button>

            {showNotifications
              ? (
                  <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0
                        ? null
                        : (
                            <div className="px-4 py-8 text-center">
                              <BellIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                              <p className="text-sm text-gray-500">No new notifications</p>
                            </div>
                          )}
                    </div>
                  </div>
                )
              : null}
          </div>

          <div className="relative">
            <button
              aria-label="Open user menu"
              className="h-10 w-10 cursor-pointer overflow-hidden rounded-full border-2 border-gray-300 transition-colors hover:border-gray-400 focus:border-[#160E53] focus:ring-2 focus:ring-[#160E53] focus:outline-none"
              type="button"
              onClick={() => setShowDropdown(previous => !previous)}
            >
              {session.user?.profileImage
                ? (
                    <Image alt={session.user.username || 'User'} className="h-full w-full object-cover" height={40} src={session.user.profileImage} unoptimized width={40} />
                  )
                : (
                    <div className="flex h-full w-full items-center justify-center bg-[#160E53] font-medium text-white">
                      {session.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
            </button>

            {showDropdown
              ? (
                  <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-200">
                          {session.user?.profileImage
                            ? <Image alt={session.user.username || 'User'} className="h-full w-full object-cover" height={48} src={session.user.profileImage} unoptimized width={48} />
                            : (
                                <div className="flex h-full w-full items-center justify-center bg-[#160E53] text-lg font-medium text-white">
                                  {session.user?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                              )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-gray-900">{session.user?.username || 'User'}</div>
                          <div className="truncate text-sm text-gray-500">{session.user?.email || 'No email'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        className="flex w-full cursor-pointer items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        type="button"
                        onClick={() => {
                          setShowDropdown(false);
                          router.push('/profile');
                        }}
                      >
                        <UserProfileIcon className="mr-3 h-4 w-4" />
                        View Profile
                      </button>

                      <div className="mt-2 border-t border-gray-100 pt-2">
                        <button
                          className="flex w-full cursor-pointer items-center px-4 py-2 text-left text-sm text-blue-600 transition-colors hover:bg-blue-50"
                          type="button"
                          onClick={async () => {
                            setShowDropdown(false);
                            await signOut();
                            router.push('/');
                            router.refresh();
                          }}
                        >
                          <span className="mr-3 text-blue-600"></span>
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )
              : null}
          </div>
        </div>
      </div>

      <DashboardCreatePostModal isOpen={showCreatePostModal} onClose={() => setShowCreatePostModal(false)} />
    </header>
  );
};
