import React from "react";

interface ChevronDownIconProps {
  className?: string;
  size?: number;
}

export const ChevronDownIcon: React.FC<ChevronDownIconProps> = ({
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
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
};

export default ChevronDownIcon;
