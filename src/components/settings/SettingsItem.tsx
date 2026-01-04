import { ReactNode } from 'react';
import Link from 'next/link';

interface SettingsItemProps {
  icon?: ReactNode;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  rightContent?: ReactNode;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

export default function SettingsItem({
  icon,
  label,
  description,
  href,
  onClick,
  rightContent,
  variant = 'default',
  disabled = false,
}: SettingsItemProps) {
  const baseClasses = `flex items-center justify-between px-4 py-4 transition-colors ${
    disabled
      ? 'opacity-50 cursor-not-allowed'
      : variant === 'danger'
      ? 'hover:bg-red-50 cursor-pointer'
      : 'hover:bg-gray-50 cursor-pointer'
  }`;

  const textColorClass = variant === 'danger' ? 'text-red-600' : 'text-gray-900';
  const descriptionColorClass = 'text-gray-500';

  const content = (
    <>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && (
          <div className={`flex-shrink-0 ${variant === 'danger' ? 'text-red-600' : 'text-gray-600'}`}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${textColorClass}`}>
            {label}
          </div>
          {description && (
            <div className={`text-xs mt-0.5 ${descriptionColorClass}`}>
              {description}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {rightContent ? (
          rightContent
        ) : !onClick || href ? (
          <svg
            className={`w-5 h-5 ${variant === 'danger' ? 'text-red-600' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        ) : null}
      </div>
    </>
  );

  if (disabled) {
    return <div className={baseClasses}>{content}</div>;
  }

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={`${baseClasses} w-full text-left`}>
        {content}
      </button>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}

