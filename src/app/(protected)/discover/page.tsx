import type { DiscoverParityConfig } from '@/modules/discover';
import { DiscoverPageClient } from '@/modules/discover';

function parseParityConfig(searchParams: Record<string, string | string[] | undefined>): DiscoverParityConfig {
  const parityEnabled = process.env.PARITY === 'true' && searchParams.parityFixtures === '1';
  const stateParam = typeof searchParams.parityState === 'string' ? searchParams.parityState : 'default';
  const sidebarParam = typeof searchParams.paritySidebar === 'string' ? searchParams.paritySidebar : '';
  const filterParam = typeof searchParams.parityFilters === 'string' ? searchParams.parityFilters : '';
  const modalParam = typeof searchParams.parityModal === 'string' ? searchParams.parityModal : '';

  const state = stateParam === 'empty' || stateParam === 'error' || stateParam === 'loading'
    ? stateParam
    : 'default';

  const forceSidebar = parityEnabled
    ? (sidebarParam === 'open'
        ? true
        : sidebarParam === 'closed'
          ? false
          : null)
    : null;

  const forceFilters = parityEnabled
    ? (filterParam === 'open'
        ? true
        : filterParam === 'closed'
          ? false
          : null)
    : null;

  return {
    enabled: parityEnabled,
    forceFilters,
    forceModal: parityEnabled && modalParam === 'open',
    forceSidebar,
    state,
  };
}

export default async function DiscoverPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const parityConfig = parseParityConfig(searchParams);

  return <DiscoverPageClient parityConfig={parityConfig} />;
}
