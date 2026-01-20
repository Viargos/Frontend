import React from "react";

interface ChevronUpIconProps {
  className?: string;
  size?: number;
}

export const ChevronUpIcon: React.FC<ChevronUpIconProps> = ({
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
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
};

export default ChevronUpIcon;

