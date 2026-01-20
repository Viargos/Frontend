import React from "react";

interface PlusIconProps {
  className?: string;
  size?: number;
}

export const PlusIcon: React.FC<PlusIconProps> = ({
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
      <path d="M12 4v16m8-8H4" />
    </svg>
  );
};

export default PlusIcon;
