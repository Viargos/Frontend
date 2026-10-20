'use client';

import { useId } from 'react';

type SettingsToggleProps = {
  checked: boolean;
  description?: string;
  icon?: React.ReactNode;
  label: string;
  onChange: (checked: boolean) => void;
};

export const SettingsToggle = (props: SettingsToggleProps) => {
  const id = useId();
  const backgroundClassName = props.checked ? 'bg-[var(--surface-inverse)]' : 'bg-[var(--surface-3)]';
  const thumbClassName = props.checked ? 'translate-x-5' : 'translate-x-0';

  return (
    <div className="flex min-w-0 items-center justify-between gap-5 px-5 py-5 transition-colors hover:bg-[var(--surface-hover)] motion-reduce:transition-none sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {props.icon ? <div aria-hidden="true" className="shrink-0 text-[var(--text-secondary)]">{props.icon}</div> : null}
        <div className="min-w-0 flex-1">
          <div className="text-[15px] leading-6 font-medium [overflow-wrap:anywhere] text-[var(--text-primary)]" id={`${id}-label`}>{props.label}</div>
          {props.description
            ? <div className="mt-1 text-[13px] leading-5 [overflow-wrap:anywhere] text-[var(--text-muted)]" id={`${id}-description`}>{props.description}</div>
            : null}
        </div>
      </div>

      <button
        role="switch"
        aria-checked={props.checked}
        aria-describedby={props.description ? `${id}-description` : undefined}
        aria-labelledby={`${id}-label`}
        onClick={() => props.onChange(!props.checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-primary)] motion-reduce:transition-none ${backgroundClassName}`}
        type="button"
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block size-5 rounded-full bg-[var(--surface-0)] shadow-sm transition-transform motion-reduce:transition-none ${thumbClassName}`}
        />
      </button>
    </div>
  );
};
