import type { ReactNode } from 'react';
import Link from 'next/link';

type SettingsItemProps = {
  description?: string;
  disabled?: boolean;
  href?: string;
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
  rightContent?: ReactNode;
  variant?: 'default' | 'danger';
  tone?: 'default' | 'danger';
};

export const SettingsItem = (props: SettingsItemProps) => {
  const {
    description,
    disabled = false,
    href,
    icon,
    label,
    onClick,
    rightContent,
    tone = 'default',
    variant,
  } = props;

  const resolvedVariant = variant || tone;

  const baseClasses = `flex items-center justify-between px-4 py-4 transition-colors ${
    disabled
      ? 'opacity-50 cursor-not-allowed'
      : resolvedVariant === 'danger'
        ? 'hover:bg-red-50 cursor-pointer'
        : 'hover:bg-gray-50 cursor-pointer'
  }`;

  const textColorClass = resolvedVariant === 'danger' ? 'text-red-600' : 'text-gray-900';
  const descriptionColorClass = 'text-gray-500';
  const iconColorClass = resolvedVariant === 'danger' ? 'text-red-600' : 'text-gray-600';
  const chevronColorClass = resolvedVariant === 'danger' ? 'text-red-600' : 'text-gray-400';
  let endContent: ReactNode = null;

  if (rightContent) {
    endContent = rightContent;
  } else if (!onClick || href) {
    endContent = <span className={`text-base leading-none ${chevronColorClass}`}>›</span>;
  }

  const content = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {icon
          ? (
              <div className={`flex-shrink-0 ${iconColorClass}`}>
                {icon}
              </div>
            )
          : null}
        <div className="min-w-0 flex-1">
          <div className={`text-sm font-medium ${textColorClass}`}>
            {label}
          </div>
          {description
            ? (
                <div className={`mt-0.5 text-xs ${descriptionColorClass}`}>
                  {description}
                </div>
              )
            : null}
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        {endContent}
      </div>
    </>
  );

  if (disabled) {
    return <div className={baseClasses}>{content}</div>;
  }

  if (href) {
    return (
      <Link className={baseClasses} href={href}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={`${baseClasses} w-full text-left`} type="button">
        {content}
      </button>
    );
  }

  return <div className={baseClasses}>{content}</div>;
};
