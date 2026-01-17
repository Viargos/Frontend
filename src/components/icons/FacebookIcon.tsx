import React from "react";

interface FacebookIconProps {
  className?: string;
  size?: number;
}

export const FacebookIcon: React.FC<FacebookIconProps> = ({
  className = "",
  size = 24,
}) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        style={{ width: size, height: size }}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z"
          fill="#1877F2"
        />
      </svg>
      <svg
        className="absolute"
        style={{
          top: `${size * 0.0625}px`,
          left: `${size * 0.0625}px`,
          width: `${size * 0.458}px`,
          height: `${size * 0.833}px`,
        }}
        viewBox="0 0 11 20"
        fill="none"
      >
        <path
          d="M9.67109 11.4688L10.2031 8H6.875V5.75C6.875 4.80102 7.34 3.875 8.83063 3.875H10.3438V0.921875C10.3438 0.921875 8.97055 0.6875 7.65758 0.6875C4.91656 0.6875 3.125 2.34875 3.125 5.35625V8H0.078125V11.4688H3.125V19.8542C4.36744 20.0486 5.63256 20.0486 6.875 19.8542V11.4688H9.67109Z"
          fill="white"
        />
      </svg>
    </div>
  );
};

export default FacebookIcon;
