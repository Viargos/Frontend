import React from "react";

interface ChevronLeftIconProps {
  className?: string;
  size?: number;
}

export const ChevronLeftIcon: React.FC<ChevronLeftIconProps> = ({
  className = "",
  size = 24,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
};

export default ChevronLeftIcon;
