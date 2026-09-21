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
    <aside className={cn('w-full xl:max-w-[340px] 2xl:max-w-[380px]', className)}>
      <div className={cn(
        'dashboard-right-panel space-y-4 transition-colors duration-200',
        contentClassName,
      )}
      >
        {children}
      </div>
    </aside>
  );
};
