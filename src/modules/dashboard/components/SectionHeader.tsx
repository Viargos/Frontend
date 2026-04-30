import type { ReactNode } from 'react';

type SectionHeaderProps = {
  actionLabel?: string;
  description?: string;
  disabled?: boolean;
  icon?: ReactNode;
  onAction?: () => void;
  title: string;
};

export const SectionHeader = (props: SectionHeaderProps) => {
  const { actionLabel, description, disabled = false, icon, onAction, title } = props;

  return (
    <div className="px-1 pt-1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon
              ? (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-[#160E53]/8 text-[#160E53] ring-1 ring-[#160E53]/10">
                    {icon}
                  </div>
                )
              : null}
            <h2 className="text-[15px] font-semibold tracking-tight text-gray-950">{title}</h2>
          </div>
          {description
            ? <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
            : null}
        </div>

        {actionLabel && onAction
          ? (
              <button
                className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={disabled}
                onClick={onAction}
                type="button"
              >
                {actionLabel}
              </button>
            )
          : null}
      </div>
    </div>
  );
};
