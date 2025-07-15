interface IconProps {
  className?: string;
  size?: number;
}

export default function NotesIcon({ className = "", size = 25 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="5"
        y="3"
        width="15"
        height="19"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2.188"
      />
      <path
        d="M1.875 1.99202H8.125"
        stroke="currentColor"
        strokeWidth="2.1875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.875 1.15853H8.125"
        stroke="currentColor"
        strokeWidth="2.1875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.875 1.32503H6.04167"
        stroke="currentColor"
        strokeWidth="2.1875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
