import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "secondary-color";
  size?: "sm" | "lg";
  icon?: ReactNode;
  iconPosition?: "leading" | "trailing";
  onClick?: () => void;
  className?: string;
}

export default function Button({
  children,
  variant = "secondary",
  size = "sm",
  icon,
  iconPosition = "leading",
  onClick,
  className = "",
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors shadow-button font-manrope";

  const sizeClasses = {
    sm: "px-3.5 py-2 text-sm leading-5",
    lg: "px-4.5 py-2.5 text-base leading-6",
  };

  const variantClasses = {
    primary:
      "bg-primary-blue border border-primary-blue text-white hover:bg-opacity-90",
    secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
    "secondary-color":
      "bg-white border border-gray-200 text-primary-blue hover:bg-gray-50",
  };

  const iconClasses = "w-5 h-5";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon && iconPosition === "leading" && (
        <span className={iconClasses}>{icon}</span>
      )}
      {children}
      {icon && iconPosition === "trailing" && (
        <span className={iconClasses}>{icon}</span>
      )}
    </button>
  );
}
