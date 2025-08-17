interface IconProps {
  className?: string;
  size?: number;
}

export default function PlaceToStayIcon({
  className = "",
  size = 26,
}: IconProps) {
  return (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    className={className}
  >
    <path stroke="silver" strokeWidth={7} d="M3.5 73.5v-12H93v12" />
    <path
      stroke="silver"
      strokeWidth={7}
      d="M57.5 73.5v-30a6 6 0 0 1 6-6H87a6 6 0 0 1 6 6V62M6.5 10.5v18a6 6 0 0 0 6 6h36a6 6 0 0 0 6-6v-18a6 6 0 0 0-6-6h-36a6 6 0 0 0-6 6Z"
    />
    <path
      stroke="silver"
      strokeWidth={7}
      d="M18 34.5v-9a6 6 0 0 1 6-6h12.5a6 6 0 0 1 6 6v9M76 37.5V23M64.506 23h22.06a1 1 0 0 0 .938-1.346l-6.263-17A1 1 0 0 0 80.303 4h-8.639a1 1 0 0 0-.922.612l-7.158 17A1 1 0 0 0 64.506 23Z"
    />
    <circle cx={76} cy={50} r={2.5} fill="#D9D9D9" stroke="silver" />
    <path
      stroke="silver"
      strokeWidth={7}
      d="M3.5 61V40a6 6 0 0 1 6-6H52a6 6 0 0 1 6 6v1"
    />
  </svg>
  );
}
