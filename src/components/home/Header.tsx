"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ImagePlusIcon from "../icons/ImagePlusIcon";
import JourneyIcon from "../icons/JourneyIcon";
import Button from "../ui/Button";
import { User } from "@/types/auth.types";
import { useAuthStoreV2 } from "@/store/auth.store.v2";
import AnimatedAuthModal from "../auth/AnimatedAuthModal";

interface HeaderProps {
  user?: User | null;
  onMobileMenuOpen?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function Header({ user, onMobileMenuOpen }: HeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authStep, setAuthStep] = useState<"login" | "signup">("login");
  const [showDropdown, setShowDropdown] = useState(false);
  const { logout, isAuthenticated } = useAuthStoreV2();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLoginClick = () => {
    setAuthStep("login");
    setIsAuthModalOpen(true);
  };

  const handleSignupClick = () => {
    setAuthStep("signup");
    setIsAuthModalOpen(true);
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
    // Reset to default step when modal closes
    setAuthStep("login");
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
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
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
          <Image src="/viargos.svg" alt="viargos" width={40} height={40} className="block sm:hidden" />
          <Image src="/viargos_full.svg" alt="viargos" width={130} height={32} className="hidden sm:block" />
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
            >
              <span className="hidden sm:inline">Create Journey</span>
            </Button>

           

            {/* Messages Icon */}
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-medium hover:opacity-80 transition-opacity"
              >
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <div className="font-medium">{user?.username}</div>
                    <div className="text-gray-500">{user?.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Logout
                  </button>
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

      {/* Animated Auth Modal */}
      <AnimatedAuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        initialStep={authStep}
      />
    </header>
  );
}
