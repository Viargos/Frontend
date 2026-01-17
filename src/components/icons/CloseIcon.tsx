import React from "react";

interface CloseIconProps {
  className?: string;
  size?: number;
}

export const CloseIcon: React.FC<CloseIconProps> = ({
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
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
};

export default CloseIcon;
