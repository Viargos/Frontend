'use client';

import type { PropsWithChildren } from 'react';
import { QueryProvider } from '@/lib/react-query/query-provider';

export const QueryAdapterProvider = (props: PropsWithChildren) => {
  const { children } = props;
  return <QueryProvider>{children}</QueryProvider>;
};
