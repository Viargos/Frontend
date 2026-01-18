interface TransportIconProps {
  className?: string;
}

export function TransportIcon({ className }: TransportIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 26 26"
      fill="none"
      className={className || "w-8 h-8"}
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        stroke="#182779"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.792 11.917h18.416m-18.416 0c-1.083 0-1.625.542-1.625 1.625v4.333c0 .542.433.975.975.975h.65v2.167c0 .542.433.975.975.975h1.083c.542 0 .975-.433.975-.975v-2.167h10.833v2.167c0 .542.434.975.975.975h1.084c.541 0 .975-.433.975-.975v-2.167h.65c.541 0 .975-.433.975-.975v-4.333c0-1.083-.542-1.625-1.625-1.625M3.792 11.917l1.625-5.417c.217-.542.758-.975 1.3-.975h13.566c.542 0 1.084.433 1.3.975l1.625 5.417M6.5 16.25a.813.813 0 1 0 0-1.625.813.813 0 0 0 0 1.625Zm13 0a.813.813 0 1 0 0-1.625.813.813 0 0 0 0 1.625Z"
      />
    </svg>
  );
}
