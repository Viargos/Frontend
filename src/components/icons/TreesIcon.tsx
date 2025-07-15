interface IconProps {
  className?: string;
  size?: number;
}

export default function TreesIcon({ className = "", size = 25 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4.36621 1.90869L7.49121 5.03369L5.40788 6.07536L9.57454 10.242L6.44954 11.2837L10.6162 15.4504H1.24121"
        stroke="currentColor"
        strokeWidth="2.1875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.32454 4.5752V1.4502"
        stroke="currentColor"
        strokeWidth="2.1875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.03353 3.24202L1.9502 1.15869"
        stroke="currentColor"
        strokeWidth="2.1875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.03418 3.20003L4.11751 1.1167"
        stroke="currentColor"
        strokeWidth="2.1875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.03353 15.5754V2.03369"
        stroke="currentColor"
        strokeWidth="2.1875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.76717 15.3617C4.84458 15.3077 3.99321 14.8481 3.44186 14.1064C2.89052 13.3647 2.69574 12.417 2.90988 11.518C2.14312 10.8806 1.72678 9.91543 1.78937 8.92033C1.85197 7.92522 2.38596 7.01983 3.22655 6.48358C2.47656 5.15121 2.80075 3.47183 3.99276 2.51434C5.18478 1.55685 6.89456 1.60246 8.03384 2.62212C9.17334 1.60411 10.8819 1.5594 12.0731 2.51642C13.2643 3.47345 13.5887 5.15151 12.8401 6.48358C13.6812 7.01936 14.2157 7.92474 14.2785 8.92001C14.3413 9.91529 13.9249 10.8807 13.1578 11.518C13.3793 12.4482 13.1627 13.4287 12.57 14.1791C11.9772 14.9295 11.0734 15.3671 10.1172 15.3669H5.95051L5.76717 15.3617Z"
        stroke="currentColor"
        strokeWidth="2.1875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
