import React from 'react';

type Point = {
  x: number;
  y: number;
};

type CurvedRouteProps = {
  from: Point;
  to: Point;
  curvature?: number;
  duration?: number;
};

const CurvedRoute: React.FC<CurvedRouteProps> = ({
  from,
  to,
  curvature = 0.4,
  duration = 2,
}) => {
  // Control point for curve
  const controlX = (from.x + to.x) / 2;
  const controlY = Math.min(from.y, to.y) - Math.abs(from.x - to.x) * curvature;

  const path = `M ${from.x},${from.y}
                Q ${controlX},${controlY}
                ${to.x},${to.y}`;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width="100%"
      height="100%"
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 6"
        className="text-blue-500 animate-dotted-path"
        style={{
          animationDuration: `${duration}s`,
        }}
      />
    </svg>
  );
};

export default CurvedRoute;
