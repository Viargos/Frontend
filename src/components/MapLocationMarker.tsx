interface MapLocationMarkerProps {
  className?: string;
}

export default function MapLocationMarker({
  className = "",
}: MapLocationMarkerProps) {
  return (
    <div className={`relative w-35 h-30 ${className}`}>
      {/* Outer circle */}
      <div className="absolute w-10 h-10 rounded-full bg-primary-dark opacity-10" />
      {/* Middle circle */}
      <div className="absolute w-6 h-6 rounded-full bg-primary-dark opacity-20 left-2 top-2" />
      {/* Inner circle */}
      <div className="absolute w-2 h-2 rounded-full bg-primary-dark left-4 top-4" />
    </div>
  );
}
