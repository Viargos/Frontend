"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ImagePlusIcon from "@/components/icons/ImagePlusIcon";
import JourneyIcon from "@/components/icons/JourneyIcon";
import Button from "@/components/ui/Button";
import { User } from "@/types/auth.types";
import { useAuthStore } from "@/store/auth.store";
import { useClickOutside } from "@/hooks/useClickOutside";
import ModalContainer from "@/components/auth/ModalContainer";

interface HeaderProps {
  user?: User | null;
  onMobileMenuOpen?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function Header({ user, onMobileMenuOpen }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout, isAuthenticated, openLogin, openSignup } = useAuthStore();
  const router = useRouter();

  // Mock notification data - replace with real data from your notification store
  const [notificationCount, setNotificationCount] = useState(3);
  const notifications = [
    {
      id: 1,
      message: "New journey shared with you",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      message: "Someone liked your post",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      message: "Journey update available",
      time: "3 hours ago",
      read: false,
    },
  ];

  // Close dropdown when clicking outside using custom hook
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setShowDropdown(false);
  });

  // Close notifications dropdown when clicking outside
  const notificationsRef = useClickOutside<HTMLDivElement>(() => {
    setShowNotifications(false);
  });

  const handleLoginClick = () => {
    openLogin();
  };

  const handleSignupClick = () => {
    openSignup();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="flex items-center justify-between w-full p-4 bg-white border-b border-gray-200 gap-2 sm:gap-4">
      {/* Logo with Hamburger */}
      <div className="flex items-center flex-shrink-0 gap-1">
        {/* Hamburger Menu - visible only on mobile when authenticated */}
        {isAuthenticated && onMobileMenuOpen && (
          <button
            onClick={onMobileMenuOpen}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}

        <div className="flex items-center justify-center text-white font-bold text-lg">
          <Image
            src="/viargos.svg"
            alt="viargos"
            width={40}
            height={40}
            className="block sm:hidden"
          />
          <Image
            src="/viargos_full.svg"
            alt="viargos"
            width={130}
            height={32}
            className="hidden sm:block"
          />
        </div>
      </div>

      {/* Desktop Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 text-sm leading-5 shadow-button"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Mobile Search Field - visible on sm and xs when authenticated */}
      {isAuthenticated && (
        <div className="md:hidden flex-1 max-w-xs mx-2">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 text-sm leading-5 shadow-button"
            />
            <svg
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<ImagePlusIcon className="text-gray-700" />}
              iconPosition="leading"
            >
              <span className="hidden sm:inline">Add Post</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={<JourneyIcon className="text-gray-700" />}
              iconPosition="leading"
              onClick={() => router.push("/create-journey")}
            >
              <span className="hidden sm:inline">Create Journey</span>
            </Button>

            {/* Notifications Icon */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>

                {/* Notification Badge */}
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium min-w-[20px]">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                    {notificationCount > 0 && (
                      <button
                        onClick={() => {
                          setNotificationCount(0);
                          // Add your mark all as read logic here
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                !notification.read
                                  ? "bg-blue-500"
                                  : "bg-transparent"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 mb-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <svg
                          className="w-12 h-12 text-gray-300 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        <p className="text-gray-500 text-sm">
                          No new notifications
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                      <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 transition-colors">
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {user?.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt={user?.username || "User"}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-900 flex items-center justify-center text-white font-medium">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                  {/* User Info Section */}
                  <div className="px-4 py-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                        {user?.profileImage ? (
                          <Image
                            src={user.profileImage}
                            alt={user?.username || "User"}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-900 flex items-center justify-center text-white font-medium text-lg">
                            {user?.username?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {user?.username || "User"}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {user?.email || "No email"}
                        </div>
                        {user?.location && (
                          <div className="text-xs text-gray-400 truncate mt-1">
                            📍 {user.location}
                          </div>
                        )}
                      </div>
                    </div>
                    {user?.bio && (
                      <div className="mt-3 text-sm text-gray-600 line-clamp-2">
                        {user.bio}
                      </div>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        router.push("/profile");
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4 mr-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        router.push("/journeys");
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4 mr-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                      My Journeys
                    </button>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4 mr-3 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Button variant="secondary" size="sm" onClick={handleLoginClick}>
              Login
            </Button>
            <Button variant="primary" size="sm" onClick={handleSignupClick}>
              Sign Up
            </Button>
          </>
        )}
      </div>

      {/* Auth Modal */}
      <ModalContainer />
    </header>
  );
}
