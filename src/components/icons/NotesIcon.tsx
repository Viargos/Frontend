interface NotesIconProps {
  className?: string;
}

export function NotesIcon({ className = "w-4 h-4" }: NotesIconProps) {
  return (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width={26}
    height={26}
    fill="none"
    className={className}
  >
    <rect
      width={14.583}
      height={18.75}
      x={5.709}
      y={3.225}
      stroke="#182779"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.188}
      rx={2.5}
    />
    <path
      stroke="#182779"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.188}
      d="M9.875 7.392h6.25M9.875 11.558h6.25M9.875 15.725h4.167"
    />
  </svg>
  );
}
