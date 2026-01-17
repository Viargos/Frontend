import React from "react";

interface GoogleIconProps {
  className?: string;
  size?: number;
}

export const GoogleIcon: React.FC<GoogleIconProps> = ({
  className = "",
  size = 24,
}) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        className="w-3 h-3 absolute left-3 top-3.5"
        viewBox="0 0 12 13"
        fill="none"
        style={{
          width: `${(size / 24) * 12}px`,
          height: `${(size / 24) * 13}px`,
          left: `${(size / 24) * 12}px`,
          top: `${(size / 24) * 14}px`,
        }}
      >
        <path
          d="M11.7663 3.2765C11.7663 2.46077 11.7001 1.64063 11.559 0.838135H0.240234V5.45912H6.72197C6.453 6.94947 5.58877 8.26786 4.32329 9.10563V12.104H8.19028C10.4611 10.014 11.7663 6.92742 11.7663 3.2765Z"
          fill="#4285F4"
        />
      </svg>
      <svg
        className="w-5 h-2.5 absolute left-2 top-4.5"
        viewBox="0 0 20 10"
        fill="none"
        style={{
          width: `${(size / 24) * 20}px`,
          height: `${(size / 24) * 10}px`,
          left: `${(size / 24) * 8}px`,
          top: `${(size / 24) * 18}px`,
        }}
      >
        <path
          d="M11.24 10.0008C14.4764 10.0008 17.2058 8.93818 19.1944 7.10389L15.3274 4.10555C14.2516 4.8375 12.8626 5.25197 11.2444 5.25197C8.11376 5.25197 5.45934 3.1399 4.50693 0.300293H0.516479V3.39124C2.55359 7.44341 6.70278 10.0008 11.24 10.0008Z"
          fill="#34A853"
        />
      </svg>
      <svg
        className="w-1.5 h-3 absolute left-1.5 top-3"
        viewBox="0 0 6 12"
        fill="none"
        style={{
          width: `${(size / 24) * 6}px`,
          height: `${(size / 24) * 12}px`,
          left: `${(size / 24) * 6}px`,
          top: `${(size / 24) * 12}px`,
        }}
      >
        <path
          d="M5.50277 8.30021C5.00011 6.80986 5.00011 5.19604 5.50277 3.70569V0.614746H1.51674C-0.185266 4.00552 -0.185266 8.00038 1.51674 11.3912L5.50277 8.30021Z"
          fill="#FBBC04"
        />
      </svg>
      <svg
        className="w-5 h-2.5 absolute left-2 top-1.5"
        viewBox="0 0 20 10"
        fill="none"
        style={{
          width: `${(size / 24) * 20}px`,
          height: `${(size / 24) * 10}px`,
          left: `${(size / 24) * 8}px`,
          top: `${(size / 24) * 6}px`,
        }}
      >
        <path
          d="M11.24 4.74966C12.9508 4.7232 14.6043 5.36697 15.8433 6.54867L19.2694 3.12262C17.1 1.0855 14.2207 -0.034466 11.24 0.000808666C6.70277 0.000808666 2.55359 2.55822 0.516479 6.61481L4.50252 9.70575C5.45052 6.86173 8.10935 4.74966 11.24 4.74966Z"
          fill="#EA4335"
        />
      </svg>
    </div>
  );
};

export default GoogleIcon;
