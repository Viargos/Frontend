'use client';

import type { ReactNode } from 'react';
import * as motion from 'framer-motion/client';

type AnimatedSidebarProps = {
  children: ReactNode;
  collapsed?: boolean;
};

export const AnimatedSidebar = (props: AnimatedSidebarProps) => {
  const { children, collapsed = false } = props;

  return (
    <motion.div
      animate={{
        x: 0,
        opacity: 1,
        width: collapsed ? '4rem' : undefined,
      }}
      className={`sticky top-0 hidden h-screen flex-shrink-0 border-r border-gray-200 bg-white transition-all duration-300 sm:block ${collapsed ? 'w-16' : 'w-16 lg:w-[272px]'}`}
      initial={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
