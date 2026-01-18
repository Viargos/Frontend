interface FoodIconProps {
  className?: string;
}

export function FoodIcon({ className = "w-8 h-8" }: FoodIconProps) {
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
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 21.667V11.083m0 0c-2.167-1.083-4.333-3.25-4.333-5.417m4.333 5.417c2.167-1.083 4.334-3.25 4.334-5.417M3.25 21.667h19.5m-16.25 0v-6.5c0-1.806 1.194-3.25 2.167-3.25h10.833c1.806 0 3.25 1.444 3.25 3.25v6.5"
    />
  </svg>
  );
}
