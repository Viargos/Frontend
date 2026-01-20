import { ReactNode } from "react";

interface PlanningCategoryProps {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  bgColor?: string;
}

export default function PlanningCategory({
  icon,
  label,
  isActive = false,
  onClick,
  bgColor = "#001A6E",
}: PlanningCategoryProps) {
  return (
    <button 
      className="flex flex-col justify-center items-center gap-2.5 cursor-pointer hover:opacity-90 transition-all"
      onClick={onClick}
    >
      <div className="text-gray-600 text-center font-manrope text-xs font-bold leading-3">
        {label}
      </div>
      <div
        className={`
        w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all shadow-sm hover:shadow-md
        ${isActive ? "ring-2 ring-offset-2 ring-blue-200" : "hover:scale-105"}
      `}
        style={{ 
          backgroundColor: bgColor,
          borderColor: '#001A6E'
        }}
      >
        <div className="w-8 h-8 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </button>
  );
}
