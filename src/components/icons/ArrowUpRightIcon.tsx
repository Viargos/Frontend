interface IconProps {
  className?: string;
  size?: number;
}

export default function ArrowUpRightIcon({
  className = "",
  size = 14,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1.0835 6.91683L6.91683 1.0835M6.91683 1.0835H1.0835M6.91683 1.0835V6.91683"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
