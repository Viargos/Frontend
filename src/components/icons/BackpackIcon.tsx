import React from "react";

interface BackpackIconProps {
  className?: string;
  size?: number;
}

export const BackpackIcon: React.FC<BackpackIconProps> = ({
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
      <path d="M20 8v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8c0-1.86 1.28-3.41 3-3.86V2h3v2h4V2h3v2.14c1.72.45 3 2 3 3.86zM6 12v2h12v-2H6zm10-6H8v2h8V6z" />
    </svg>
  );
};

export default BackpackIcon;

