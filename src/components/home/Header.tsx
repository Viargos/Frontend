"use client";

import { useState, useEffect, useRef } from "react";
import ImagePlusIcon from "../icons/ImagePlusIcon";
import JourneyIcon from "../icons/JourneyIcon";
import Button from "../ui/Button";
import { User } from "@/types/auth.types";
import { useAuthStore } from "@/store/auth.store";
import AuthModal from "../auth/AuthModal";

interface HeaderProps {
  user?: User;
}

export default function Header({ user }: HeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authStep, setAuthStep] = useState<"login" | "signup">("login");
  const [showDropdown, setShowDropdown] = useState(false);
  const { logout, isAuthenticated } = useAuthStore();
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

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="flex justify-between items-center w-full p-4 bg-white border-b border-gray-200">
      {/* Logo */}
      <div className="flex items-center">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
          V
        </div>
        <h1 className="text-2xl font-bold text-gray-900">viargos</h1>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Q Search"
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<ImagePlusIcon className="text-gray-700" />}
              iconPosition="leading"
            >
              Add Post
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={<JourneyIcon className="text-gray-700" />}
              iconPosition="leading"
            >
              Create Journey
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialStep={authStep}
      />
    </header>
  );
}
