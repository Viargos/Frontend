import { useState } from 'react';

interface SettingsToggleProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

export default function SettingsToggle({
  label,
  description,
  icon,
  defaultChecked = false,
  onChange,
}: SettingsToggleProps) {
  const [checked, setChecked] = useState(defaultChecked);

  const handleToggle = () => {
    const newValue = !checked;
    setChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="flex items-center justify-between px-4 py-4 hover:bg-gray-50">
      <div className="flex items-center gap-3 flex-1">
        {icon && <div className="flex-shrink-0 text-gray-600">{icon}</div>}
        <div>
          <div className="text-sm font-medium text-gray-900">{label}</div>
          {description && (
            <div className="text-xs text-gray-500 mt-0.5">{description}</div>
          )}
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 ${
          checked ? 'bg-primary-blue' : 'bg-gray-200'
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

