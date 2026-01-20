import React from "react";

interface ArrowLeftSimpleIconProps {
  className?: string;
  size?: number;
}

export const ArrowLeftSimpleIcon: React.FC<ArrowLeftSimpleIconProps> = ({
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
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
};

export default ArrowLeftSimpleIcon;

