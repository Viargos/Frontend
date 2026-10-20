import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

type SettingsItemProps = {
  description?: string;
  disabled?: boolean;
  href?: string;
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  rightContent?: React.ReactNode;
  variant?: 'default' | 'danger';
  tone?: 'default' | 'danger';
};

export const SettingsItem = (props: SettingsItemProps) => {
  const resolvedVariant = props.variant || props.tone || 'default';
  const isActionable = Boolean(props.href || props.onClick);
  const baseClasses = `flex min-w-0 w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors motion-reduce:transition-none sm:px-6 ${
    props.disabled
      ? 'cursor-not-allowed opacity-50'
      : !isActionable
          ? ''
          : resolvedVariant === 'danger'
            ? 'cursor-pointer hover:bg-red-500/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--text-primary)]'
            : 'cursor-pointer hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--text-primary)]'
  }`;

  const textColorClass = resolvedVariant === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-[var(--text-primary)]';
  const iconColorClass = resolvedVariant === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-[var(--text-secondary)]';
  let endContent: React.ReactNode = null;

  if (props.rightContent !== undefined) {
    endContent = props.rightContent;
  } else if (isActionable && !props.disabled) {
    endContent = <ChevronRight aria-hidden="true" className="size-4 text-[var(--text-muted)]" />;
  }

  const content = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {props.icon
          ? (
              <div aria-hidden="true" className={`shrink-0 ${iconColorClass}`}>
                {props.icon}
              </div>
            )
          : null}
        <div className="min-w-0 flex-1">
          <div className={`text-[15px] leading-6 font-medium [overflow-wrap:anywhere] ${textColorClass}`}>
            {props.label}
          </div>
          {props.description
            ? (
                <div className="mt-1 text-[13px] leading-5 [overflow-wrap:anywhere] text-[var(--text-muted)]">
                  {props.description}
                </div>
              )
            : null}
        </div>
      </div>
      {endContent !== null && endContent !== undefined
        ? <div className="flex shrink-0 items-center gap-2 text-xs text-[var(--text-muted)]">{endContent}</div>
        : null}
    </>
  );

  if (props.href && !props.disabled) {
    return (
      <Link className={baseClasses} href={props.href}>
        {content}
      </Link>
    );
  }

  if (props.onClick) {
    return (
      <button disabled={props.disabled} onClick={props.onClick} className={baseClasses} type="button">
        {content}
      </button>
    );
  }

  return (
    <div aria-disabled={props.disabled || undefined} className={baseClasses} role={props.href ? 'link' : undefined}>
      {content}
    </div>
  );
};
