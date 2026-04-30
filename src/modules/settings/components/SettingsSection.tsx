import type { ReactNode } from 'react';

type SettingsSectionProps = {
  children: ReactNode;
  title?: string;
};

export const SettingsSection = (props: SettingsSectionProps) => {
  const { children, title } = props;
  const titleNode = title
    ? (
        <h3 className="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
          {title}
        </h3>
      )
    : null;

  return (
    <div className="flex flex-col">
      {titleNode}
      <div className="divide-y divide-gray-200 border-y border-gray-200 bg-white">
        {children}
      </div>
    </div>
  );
};
