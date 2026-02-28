'use client';

type SettingsToggleProps = {
  checked: boolean;
  description?: string;
  icon?: React.ReactNode;
  label: string;
  onChange: (checked: boolean) => void;
};

export const SettingsToggle = (props: SettingsToggleProps) => {
  const { checked, description, icon, label, onChange } = props;
  const backgroundClassName = checked ? 'bg-[#160E53]' : 'bg-gray-200';
  const thumbClassName = checked ? 'translate-x-5' : 'translate-x-0';
  const descriptionNode = description
    ? (
        <div className="mt-0.5 text-xs text-gray-500">{description}</div>
      )
    : null;

  return (
    <div className="flex items-center justify-between px-4 py-4 hover:bg-gray-50">
      <div className="flex flex-1 items-center gap-3">
        {icon ? <div className="flex-shrink-0 text-gray-600">{icon}</div> : null}
        <div>
          <div className="text-sm font-medium text-gray-900">{label}</div>
          {descriptionNode}
        </div>
      </div>

      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-[#160E53] focus:ring-offset-2 focus:outline-none ${backgroundClassName}`}
        type="button"
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${thumbClassName}`}
        />
      </button>
    </div>
  );
};
