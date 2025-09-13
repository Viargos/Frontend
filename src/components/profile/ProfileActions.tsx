"use client";

import { useState } from "react";
import JourneyIcon from "@/components/icons/JourneyIcon";
import ImagePlusIcon from "@/components/icons/ImagePlusIcon";
import MapIcon from "@/components/icons/MapIcon";
import CreatePostModal from "@/components/post/CreatePostModal";

interface ActionButtonProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

function ActionButton({
  children,
  icon,
  variant = "secondary",
  onClick,
}: ActionButtonProps) {
  const baseClasses =
    "flex items-center rounded-md shadow-sm transition-colors cursor-pointer hover:opacity-80 active:scale-95";

  const variantClasses = {
    primary: "bg-primary-blue text-white hover:bg-blue-700",
    secondary:
      "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-800",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
      type="button"
    >
      <div className="flex px-5 py-2.5 items-center gap-2">
        <span className="w-6 h-6">{icon}</span>
        <span className="font-manrope text-[15px] font-bold leading-normal tracking-wide">
          {children}
        </span>
      </div>
    </button>
  );
}

export default function ProfileActions() {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  const handleCreatePost = () => {
    console.log("Post button clicked!");
    setShowCreatePostModal(true);
  };

  const handlePostSuccess = (postId: string) => {
    console.log("Post created successfully:", postId);
    // You can add additional logic here like refreshing the posts list
  };

  return (
    <>
      <div className="flex items-center w-full">
        <ActionButton
          variant="primary"
          icon={<JourneyIcon className="text-white" />}
        >
          Journey
        </ActionButton>

        <ActionButton
          variant="secondary"
          icon={<ImagePlusIcon className="text-gray-400" />}
          onClick={handleCreatePost}
        >
          Post
        </ActionButton>

        <ActionButton
          variant="secondary"
          icon={<MapIcon className="text-gray-400" />}
        >
          Map
        </ActionButton>
      </div>

      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onSuccess={handlePostSuccess}
      />
    </>
  );
}
