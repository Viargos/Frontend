export type SettingsItemModel = {
  id: string;
  label: string;
  description?: string;
  href?: string;
  tone?: 'default' | 'danger';
};

export type SettingsSectionModel = {
  id: string;
  title?: string;
  items: SettingsItemModel[];
};

export type SettingsToggleModel = {
  id: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
};
