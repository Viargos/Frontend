'use client';

import { useMemo, useState } from 'react';
import { SETTINGS_TOGGLES } from '@/modules/settings/constants/settings.constants';

export function useSettings() {
  const [toggleState, setToggleState] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};

    for (const toggle of SETTINGS_TOGGLES) {
      initial[toggle.id] = toggle.defaultChecked ?? false;
    }

    return initial;
  });

  const toggles = useMemo(
    () => SETTINGS_TOGGLES.map(toggle => ({ ...toggle, checked: toggleState[toggle.id] ?? false })),
    [toggleState],
  );

  const setToggle = (id: string, checked: boolean) => {
    setToggleState(previous => ({ ...previous, [id]: checked }));
  };

  return {
    setToggle,
    toggles,
  };
}
