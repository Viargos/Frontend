'use client';

import { useState, ReactNode } from 'react';
import { useAuthStoreV2 } from '@/store/auth.store.v2';
import BaseLayout from './BaseLayout';
import AnimatedSidebar from './AnimatedSidebar';
import Header from '@/components/home/Header';
import LeftSidebar from '@/app/components/LeftSidebar';
import RightSidebar from '@/app/components/RightSidebar';

export interface AuthenticatedLayoutV2Props {
  children: ReactNode;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
  leftSidebarContent?: ReactNode;
  rightSidebarContent?: ReactNode;
}

export default function AuthenticatedLayoutV2({
  children,
  showLeftSidebar = true,
  showRightSidebar = true,
  leftSidebarContent,
  rightSidebarContent,
}: AuthenticatedLayoutV2Props) {
  const { user, logout } = useAuthStoreV2();
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const handleMobileMenuOpen = () => {
    setIsLeftSidebarOpen(true);
  };

  if (!user) {
    return null; // This should not happen as this component is only for authenticated users
  }

  const leftSidebar = showLeftSidebar ? (
    <AnimatedSidebar
      isOpen={isLeftSidebarOpen}
      onClose={() => setIsLeftSidebarOpen(false)}
      title="Navigation"
      position="left"
      width="w-64"
    >
      {leftSidebarContent || (
        <LeftSidebar 
          user={user} 
          onLogout={logout}
          onNavigate={() => setIsLeftSidebarOpen(false)}
        />
      )}
    </AnimatedSidebar>
  ) : null;

  const rightSidebar = showRightSidebar ? (
    <AnimatedSidebar
      isOpen={isRightSidebarOpen}
      onClose={() => setIsRightSidebarOpen(false)}
      title="Information"
      position="right"
      width="w-80"
      showOnDesktop={true}
      desktopBreakpoint="xl"
    >
      {rightSidebarContent || <RightSidebar />}
    </AnimatedSidebar>
  ) : null;

  const header = (
    <Header 
      user={user} 
      onMobileMenuOpen={showLeftSidebar ? handleMobileMenuOpen : undefined}
    />
  );

  return (
    <BaseLayout header={header} sidebar={leftSidebar}>
      <div className="flex flex-col xl:flex-row h-full">
        <div className="flex-1 p-4 sm:p-6">{children}</div>
        {rightSidebar}
      </div>
    </BaseLayout>
  );
}
