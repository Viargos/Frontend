import type { ReactNode } from 'react';
import { cn } from '@/modules/common/components/ui/cn';

type RightPanelContainerProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export const RightPanelContainer = (props: RightPanelContainerProps) => {
  const { children, className, contentClassName } = props;

  return (
    <aside className={cn('w-full xl:ml-auto xl:max-w-[300px]', className)}>
      <div className={cn(
        'dashboard-right-panel rounded-[28px] bg-white/90 p-3 shadow-[0px_18px_40px_-30px_rgba(15,23,42,0.55)] ring-1 ring-black/5 backdrop-blur-sm',
        contentClassName,
      )}
      >
        {children}
      </div>
    </aside>
  );
};
