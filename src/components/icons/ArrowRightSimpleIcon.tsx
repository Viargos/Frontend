import React from "react";

interface ArrowRightSimpleIconProps {
  className?: string;
  size?: number;
}

export const ArrowRightSimpleIcon: React.FC<ArrowRightSimpleIconProps> = ({
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
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
};

export default ArrowRightSimpleIcon;

