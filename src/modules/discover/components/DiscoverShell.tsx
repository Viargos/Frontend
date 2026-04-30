'use client';

type DiscoverShellProps = {
  children: React.ReactNode;
  hasSelection?: boolean;
  itemCount?: number;
};

export const DiscoverShell = (props: DiscoverShellProps) => {
  const { children, hasSelection = false, itemCount = 0 } = props;

  return (
    <div
      className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#f6f7f8]"
      data-discover-item-count={itemCount}
      data-discover-selection={hasSelection ? 'active' : 'idle'}
      data-parity-page="discover"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(22,14,83,0.08),transparent_40%),radial-gradient(circle_at_top_right,rgba(8,145,178,0.08),transparent_32%)]" />
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
};
