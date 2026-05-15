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
                  <div className="dashboard-section-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-[#f8d775]/20 bg-[#f8d775]/10 text-[#f8d775] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    {icon}
                  </div>
                )
              : null}
            <h2 className="dashboard-section-title text-[15px] font-semibold tracking-tight text-slate-100">{title}</h2>
          </div>
          {description
            ? <p className="dashboard-section-description mt-1 text-xs leading-5 text-slate-400">{description}</p>
            : null}
        </div>

        {actionLabel && onAction
          ? (
              <button
                className="dashboard-section-action shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
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
