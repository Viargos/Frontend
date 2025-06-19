interface IconProps {
  className?: string;
  size?: number;
}

export default function CalendarIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="3"
        y="3"
        width="11"
        height="11"
        rx="1.333"
        stroke="currentColor"
        strokeWidth="1.167"
      />
      <path
        d="M10.6666 1V3.66667"
        stroke="currentColor"
        strokeWidth="1.167"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.33333 1V3.66667"
        stroke="currentColor"
        strokeWidth="1.167"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 7.33333H14"
        stroke="currentColor"
        strokeWidth="1.167"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="8"
        cy="10.5"
        r="0.5"
        stroke="currentColor"
        strokeWidth="1.167"
      />
    </svg>
  );
}
