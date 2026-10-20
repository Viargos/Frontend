type SettingsSectionProps = {
  children: React.ReactNode;
  title?: string;
};

export const SettingsSection = (props: SettingsSectionProps) => {
  return (
    <section className="flex min-w-0 flex-col bg-[var(--surface-0)]">
      {props.title
        ? (
            <h3 className="px-5 pt-6 pb-3 text-base font-bold text-[var(--text-primary)] sm:px-6">
              {props.title}
            </h3>
          )
        : null}
      <div className="min-w-0 divide-y divide-[var(--border-subtle)] border-b border-[var(--border-subtle)]">
        {props.children}
      </div>
    </section>
  );
};
