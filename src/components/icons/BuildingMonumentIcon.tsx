interface IconProps {
  className?: string;
  size?: number;
}

export default function BuildingMonumentIcon({
  className = "",
  size = 12,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1.2085 8.3999L2.2085 1.8999L3.2085 0.899902L4.2085 1.8999L5.2085 8.3999"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.708496 2.8999V1.3999H7.7085V2.8999"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.708496 0.899902H9.7085"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
