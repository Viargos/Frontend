interface IconProps {
  className?: string;
  size?: number;
}

export default function ArrowDownIcon({
  className = "",
  size = 20,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 15 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M7.50008 1.16675V12.8334M7.50008 12.8334L13.3334 7.00008M7.50008 12.8334L1.66675 7.00008"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
