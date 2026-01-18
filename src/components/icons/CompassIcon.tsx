import React from "react";

interface CompassIconProps {
  className?: string;
  size?: number;
}

export const CompassIcon: React.FC<CompassIconProps> = ({
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
      <path d="M12 2L8 12l4 10 4-10-4-10zm0 3.5L13.5 10h-3L12 5.5z" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 7l-1 5h2l-1-5zm0 10l-1-5h2l-1 5z" />
    </svg>
  );
};

export default CompassIcon;

