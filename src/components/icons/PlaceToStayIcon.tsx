interface IconProps {
  className?: string;
  size?: number;
}

export default function PlaceToStayIcon({
  className = "w-8 h-8",
  size = 26,
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 24"
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <g stroke="#182779" clipPath="url(#a)">
        <path strokeWidth={2.19} d="M1.154 23.838v-3.892H30.68v3.892" />
        <path
          strokeWidth={2.19}
          d="M18.969 23.838v-9.73c0-1.075.886-1.946 1.98-1.946H28.7c1.093 0 1.98.871 1.98 1.946v6M2.145 3.405v5.838c0 1.075.886 1.946 1.979 1.946H16c1.093 0 1.98-.871 1.98-1.946V3.405c0-1.074-.887-1.946-1.98-1.946H4.124c-1.093 0-1.98.872-1.98 1.946Z"
        />
        <path
          strokeWidth={2.19}
          d="M5.938 11.19V8.27c0-1.075.887-1.946 1.98-1.946h4.124c1.093 0 1.979.871 1.979 1.946v2.92M25.072 12.162V7.46M21.28 7.46h7.278c.23 0 .389-.225.31-.437L26.8 1.51a.33.33 0 0 0-.31-.213h-2.85a.33.33 0 0 0-.303.199l-2.362 5.513a.325.325 0 0 0 .305.45Z"
        />
        <path
          fill="#D9D9D9"
          d="M25.072 17.027a.818.818 0 0 0 .825-.81c0-.448-.37-.811-.825-.811a.818.818 0 0 0-.825.81c0 .448.37.811.825.811Z"
        />
        <path
          strokeWidth={2.19}
          d="M1.154 19.784v-6.811c0-1.075.887-1.946 1.98-1.946h14.02c1.093 0 1.98.871 1.98 1.946v.324"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h32v24H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}
