interface IconProps {
  className?: string;
  size?: number;
}

export default function PlaceToStayIcon({
  className = "",
  size = 24,
}: IconProps) {
  return (
    <div
      className={`w-6 h-6 rounded-full bg-black flex items-center justify-center ${className}`}
    >
      <div className="w-4 h-4 bg-white rounded opacity-50" />
    </div>
  );
}
