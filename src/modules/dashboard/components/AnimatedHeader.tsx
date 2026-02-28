'use client';

import type { ReactNode } from 'react';
import * as motion from 'framer-motion/client';

type AnimatedHeaderProps = {
  children: ReactNode;
};

export const AnimatedHeader = (props: AnimatedHeaderProps) => {
  const { children } = props;

  return (
    <motion.div
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-gray-200 bg-white"
      initial={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
};
