'use client';

import type { SettingsCategoryId } from '@/modules/settings/constants/settings-copy';
import { Ban, CircleHelp, FileText, Globe, Image, Info, KeyRound, LockKeyhole, LogOut, Mail, MessageCircle, Moon, Phone, ShieldCheck, Sparkles, Trash2, UserRound } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { useAuthSession } from '@/modules/auth';
import { Skeleton, useTheme, useThemeBackground } from '@/modules/common';
import { NotificationSettings } from '@/modules/notifications';
import { SettingsItem } from '@/modules/settings/components/SettingsItem';
import { SettingsSection } from '@/modules/settings/components/SettingsSection';
import { SettingsToggle } from '@/modules/settings/components/SettingsToggle';
import { ThemeBackgroundSelector } from '@/modules/settings/components/ThemeBackgroundSelector';
import { SETTINGS_COPY } from '@/modules/settings/constants/settings-copy';
import { SETTINGS_FEATURES, SETTINGS_LINK_AVAILABILITY } from '@/modules/settings/constants/settings.features';
import { focusSettingsSection } from '@/modules/settings/helpers/focus-settings-section';
import { useSettings } from '@/modules/settings/hooks/use-settings';

const subscribeToHydration = () => () => undefined;

function UnavailableSetting(props: { label: string; icon: React.ReactNode; href?: string; danger?: boolean }) {
  return (
    <SettingsItem
      description={SETTINGS_COPY.comingSoon}
      disabled={!props.href}
      href={props.href}
      icon={props.icon}
      label={props.label}
      rightContent={<span className="text-xs text-[var(--text-muted)]">{SETTINGS_COPY.soon}</span>}
      variant={props.danger ? 'danger' : 'default'}
    />
  );
}

export function SettingsCategoryContent(props: {
  category: SettingsCategoryId;
  onEditProfile: () => void;
  onLogout: () => void;
}) {
  const { session } = useAuthSession();
  const { isDark, setTheme } = useTheme();
  const { selectedBackground } = useThemeBackground();
  const { setToggle, toggles } = useSettings();
  const isHydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const iconClassName = 'h-5 w-5';

  // Account and theme data can resolve before this streamed panel hydrates.
  if (!isHydrated) {
    return (
      <div aria-busy="true" aria-label={SETTINGS_COPY.loading} className="space-y-8 px-5 py-5" role="status">
        {[0, 1, 2].map(item => (
          <div key={item} className="space-y-3">
            <Skeleton className="h-4 w-36 max-w-full" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
        ))}
      </div>
    );
  }

  switch (props.category) {
    case 'account':
      return (
        <>
          <SettingsSection>
            <SettingsItem description={SETTINGS_COPY.editProfileDescription} icon={<UserRound aria-hidden="true" className={iconClassName} />} label={SETTINGS_COPY.editProfile} onClick={props.onEditProfile} />
            <SettingsItem
              description={SETTINGS_FEATURES.changePassword ? SETTINGS_COPY.changePasswordDescription : SETTINGS_COPY.comingSoon}
              disabled={!SETTINGS_FEATURES.changePassword}
              href={SETTINGS_FEATURES.changePassword ? '/settings/change-password' : undefined}
              icon={<KeyRound aria-hidden="true" className={iconClassName} />}
              label={SETTINGS_COPY.changePassword}
              rightContent={SETTINGS_FEATURES.changePassword ? undefined : <span className="text-xs text-[var(--text-muted)]">{SETTINGS_COPY.soon}</span>}
            />
            <SettingsItem
              description={session.user?.email ?? SETTINGS_COPY.notSet}
              icon={<Mail aria-hidden="true" className={iconClassName} />}
              label={SETTINGS_COPY.email}
              rightContent={session.user?.email ? <span className="text-xs text-[var(--text-muted)]">{SETTINGS_COPY.verified}</span> : null}
            />
            <SettingsItem description={SETTINGS_COPY.notSet} icon={<Phone aria-hidden="true" className={iconClassName} />} label={SETTINGS_COPY.phone} />
          </SettingsSection>
          <div className="mt-6 border-t border-[var(--border-subtle)] pt-2">
            <SettingsSection title={SETTINGS_COPY.accountActions}>
              <SettingsItem description={SETTINGS_COPY.logoutDescription} icon={<LogOut aria-hidden="true" className={iconClassName} />} label={SETTINGS_COPY.logout} onClick={props.onLogout} />
              <UnavailableSetting danger href={SETTINGS_LINK_AVAILABILITY.deleteAccount ? '/settings/delete-account' : undefined} icon={<Trash2 aria-hidden="true" className={iconClassName} />} label={SETTINGS_COPY.deleteAccount} />
            </SettingsSection>
          </div>
        </>
      );
    case 'privacy':
      return (
        <SettingsSection>
          <UnavailableSetting href={SETTINGS_LINK_AVAILABILITY.privacy ? '/settings/privacy' : undefined} icon={<ShieldCheck aria-hidden="true" className={iconClassName} />} label={SETTINGS_COPY.privacy} />
          <SettingsToggle
            checked={toggles.find(toggle => toggle.id === 'private-account')?.checked ?? false}
            description={SETTINGS_COPY.privateAccountDescription}
            icon={<LockKeyhole aria-hidden="true" className={iconClassName} />}
            label={SETTINGS_COPY.privateAccount}
            onChange={checked => setToggle('private-account', checked)}
          />
          <UnavailableSetting href={SETTINGS_LINK_AVAILABILITY.blockedAccounts ? '/settings/blocked' : undefined} icon={<Ban aria-hidden="true" className={iconClassName} />} label={SETTINGS_COPY.blockedAccounts} />
        </SettingsSection>
      );
    case 'notifications':
      return <NotificationSettings />;
    case 'display':
      return (
        <>
          <SettingsSection>
            <SettingsToggle checked={isDark} description={isDark ? SETTINGS_COPY.darkModeEnabled : SETTINGS_COPY.lightModeEnabled} icon={<Moon aria-hidden="true" className={iconClassName} />} label={SETTINGS_COPY.darkMode} onChange={checked => setTheme(checked ? 'dark' : 'light')} />
            <SettingsItem
              description={selectedBackground?.name ?? SETTINGS_COPY.automaticBackground}
              icon={<Image aria-hidden="true" className={iconClassName} />}
              label={SETTINGS_COPY.changeBackground}
              onClick={() => focusSettingsSection(document.getElementById('theme-background-selector'))}
            />
            <UnavailableSetting href={SETTINGS_LINK_AVAILABILITY.language ? '/settings/language' : undefined} icon={<Globe aria-hidden="true" className={iconClassName} />} label={SETTINGS_COPY.language} />
          </SettingsSection>
          <div className="mt-6 border-t border-[var(--border-subtle)] pt-2"><ThemeBackgroundSelector /></div>
        </>
      );
    case 'help':
      return (
        <SettingsSection>
          <UnavailableSetting href={SETTINGS_LINK_AVAILABILITY.helpCenter ? '/help' : undefined} icon={<CircleHelp aria-hidden="true" className={iconClassName} />} label={SETTINGS_COPY.helpCenter} />
          <UnavailableSetting href={SETTINGS_LINK_AVAILABILITY.contact ? '/contact' : undefined} icon={<MessageCircle aria-hidden="true" className={iconClassName} />} label={SETTINGS_COPY.contact} />
          <UnavailableSetting href={SETTINGS_LINK_AVAILABILITY.termsOfService ? '/terms' : undefined} icon={<FileText aria-hidden="true" className={iconClassName} />} label={SETTINGS_COPY.terms} />
          <UnavailableSetting href={SETTINGS_LINK_AVAILABILITY.privacyPolicy ? '/privacy' : undefined} icon={<ShieldCheck aria-hidden="true" className={iconClassName} />} label={SETTINGS_COPY.privacyPolicy} />
        </SettingsSection>
      );
    case 'about':
      return (
        <>
          <SettingsSection>
            <SettingsItem description="1.0.0" icon={<Info aria-hidden="true" className={iconClassName} />} label={SETTINGS_COPY.appVersion} />
            <UnavailableSetting href={SETTINGS_LINK_AVAILABILITY.whatsNew ? '/whats-new' : undefined} icon={<Sparkles aria-hidden="true" className={iconClassName} />} label={SETTINGS_COPY.whatsNew} />
          </SettingsSection>
          <p className="px-5 pt-8 text-xs text-[var(--text-muted)]">{SETTINGS_COPY.copyright}</p>
        </>
      );
  }
}
