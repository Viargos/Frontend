interface TreesIconProps {
  className?: string;
}

export function TreesIcon({ className = "w-8 h-8" }: TreesIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 26 26"
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
    <path
      stroke="#182779"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.188}
      d="m17.366 5.309 3.125 3.125-2.083 1.041 4.166 4.167-3.125 1.042 4.167 4.166h-9.375M16.325 21.975V18.85M9.034 13.642 6.95 11.559M9.034 12.6l2.083-2.083M9.034 21.975V8.434"
    />
    <path
      stroke="#182779"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.188}
      d="M6.767 16.762a3.125 3.125 0 0 1-2.857-3.844 3.123 3.123 0 0 1 .317-5.035 3.125 3.125 0 0 1 4.807-3.861 3.125 3.125 0 0 1 4.806 3.861 3.122 3.122 0 0 1 .318 5.035 3.125 3.125 0 0 1-3.04 3.849H6.95l-.184-.005Z"
      clipRule="evenodd"
    />
  </svg>
  );
}
