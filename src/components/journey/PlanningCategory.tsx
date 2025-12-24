import { ReactNode } from "react";

interface PlanningCategoryProps {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function PlanningCategory({
  icon,
  label,
  isActive = false,
  onClick,
}: PlanningCategoryProps) {
  return (
    <button 
      className="flex flex-col justify-center items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={onClick}
    >
      <div className="text-gray-600 text-center font-manrope text-xs font-bold leading-3">
        {label}
      </div>
      <div
        className={`
        w-14 h-14 rounded-full flex items-center justify-center border transition-all
        ${isActive ? "bg-primary-blue text-white" : "border-gray-200 bg-white text-black hover:border-gray-300"}
      `}
      >
        <div className="w-8 h-8 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </button>
  );
}
