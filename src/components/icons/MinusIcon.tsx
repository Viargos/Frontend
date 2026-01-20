import React from "react";

interface MinusIconProps {
  className?: string;
  size?: number;
}

export const MinusIcon: React.FC<MinusIconProps> = ({
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
      <path d="M20 12H4" />
    </svg>
  );
};

export default MinusIcon;
