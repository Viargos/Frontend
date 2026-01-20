import React from "react";

interface CameraIconProps {
  className?: string;
  size?: number;
}

export const CameraIcon: React.FC<CameraIconProps> = ({
  className = "",
  size = 24,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 15.2c-2.5 0-4.5-2-4.5-4.5S9.5 6.2 12 6.2s4.5 2 4.5 4.5-2 4.5-4.5 4.5zM12 8.2c-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5z" />
      <path d="M20 5h-3.2L15 3H9L7.2 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 14H4V7h4.5l1.8-2h3.4l1.8 2H20v12z" />
    </svg>
  );
};

export default CameraIcon;

