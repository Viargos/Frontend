"use client";

import { useState } from "react";
import ImagePlusIcon from "../icons/ImagePlusIcon";
import JourneyIcon from "../icons/JourneyIcon";
import Button from "../ui/Button";
import LoginModal from "../ui/LoginModal";

export default function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <>
      <header className="flex justify-between items-center w-full mb-6">
        <h1 className="text-xl font-bold text-gray-900 font-inter leading-[38px]">
          Hi, Vivek
        </h1>

        <div className="flex items-center gap-6">
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

          <Button variant="primary" size="sm" onClick={handleOpenLoginModal}>
            Login
          </Button>
        </div>
      </header>

      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
    </>
  );
}
