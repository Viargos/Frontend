import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "indigo";
  icon?: ReactNode;
  size?: "md";
}

export default function Badge({
  children,
  variant = "success",
  icon,
  size = "md",
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-2xl font-manrope";

  const sizeClasses = {
    md: icon
      ? "px-2.5 py-0.5 gap-1 text-sm leading-5"
      : "px-2.5 py-0.5 text-sm leading-5",
  };

  const variantClasses = {
    success: "bg-success-50 text-success-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {icon && <span className="w-3 h-3">{icon}</span>}
      {children}
    </span>
  );
}
