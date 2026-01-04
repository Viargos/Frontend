import { ReactNode } from 'react';

interface SettingsSectionProps {
  title?: string;
  children: ReactNode;
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="flex flex-col">
      {title && (
        <h3 className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="bg-white border-y border-gray-200 divide-y divide-gray-200">
        {children}
      </div>
    </div>
  );
}

