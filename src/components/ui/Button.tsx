import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "secondary-color";
  size?: "sm" | "lg";
  icon?: ReactNode;
  iconPosition?: "leading" | "trailing";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  variant = "secondary",
  size = "sm",
  icon,
  iconPosition = "leading",
  onClick,
  className = "",
  disabled = false,
  loading = false,
  type = "button",
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
  const isDisabled = disabled || loading;

  const loadingSpinner = (
    <div className="animate-spin rounded-full border-2 border-gray-300 border-t-current w-4 h-4" />
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? (
        loadingSpinner
      ) : (
        icon && iconPosition === "leading" && (
          <span className={iconClasses}>{icon}</span>
        )
      )}
      {children}
      {!loading && icon && iconPosition === "trailing" && (
        <span className={iconClasses}>{icon}</span>
      )}
    </button>
  );
}
