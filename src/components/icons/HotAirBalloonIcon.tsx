import React from "react";

interface HotAirBalloonIconProps {
  className?: string;
  size?: number;
}

export const HotAirBalloonIcon: React.FC<HotAirBalloonIconProps> = ({
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
      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm1 16h-2v-2h2v2zm3-4.5c0 .83-.67 1.5-1.5 1.5h-3c-.83 0-1.5-.67-1.5-1.5v-.5h6v.5zm-.5-3.5c0 1.93-1.57 3.5-3.5 3.5S8.5 11.93 8.5 10c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5z" />
      <circle cx="12" cy="10" r="2.5" opacity="0.6" />
    </svg>
  );
};

export default HotAirBalloonIcon;

