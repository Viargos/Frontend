import React from "react";

interface SocialNetworkIllustrationProps {
  className?: string;
}

export const SocialNetworkIllustration: React.FC<
  SocialNetworkIllustrationProps
> = ({ className = "" }) => {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className={className}>
      {/* Connection lines */}
      <line
        x1="30"
        y1="30"
        x2="60"
        y2="60"
        stroke="#001a6e"
        strokeWidth="2"
      />
      <line
        x1="90"
        y1="30"
        x2="60"
        y2="60"
        stroke="#001a6e"
        strokeWidth="2"
      />
      <line
        x1="60"
        y1="60"
        x2="60"
        y2="90"
        stroke="#001a6e"
        strokeWidth="2"
      />

      {/* User nodes */}
      <circle cx="30" cy="30" r="8" fill="#001a6e" />
      <circle cx="90" cy="30" r="8" fill="#001a6e" />
      <circle cx="60" cy="60" r="10" fill="#ffcf56" />
      <circle cx="60" cy="90" r="8" fill="#001a6e" />
    </svg>
  );
};

export default SocialNetworkIllustration;
