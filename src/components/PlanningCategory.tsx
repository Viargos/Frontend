import { ReactNode } from "react";

interface PlanningCategoryProps {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
}

export default function PlanningCategory({
  icon,
  label,
  isActive = false,
}: PlanningCategoryProps) {
  return (
    <div className="flex flex-col justify-center items-center gap-2.5">
      <div className="text-gray-600 text-center font-manrope text-xs font-bold leading-3">
        {label}
      </div>
      <div
        className={`
        flex min-w-12 min-h-12 flex-col justify-center items-center gap-2 rounded-full border
        ${isActive ? "border-black bg-black text-white" : "border-gray-200 bg-white text-black"}
      `}
      >
        <span className="w-6 h-6 flex items-center justify-center">{icon}</span>
      </div>
    </div>
  );
}
