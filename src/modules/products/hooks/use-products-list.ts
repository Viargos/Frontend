'use client';

import { useQuery } from '@tanstack/react-query';
import { productQueryKeys } from '@/modules/products/query-keys';
import { productsService } from '@/modules/products/services/products.service';

export function useProductsList() {
  return useQuery({
    queryFn: () => productsService.list(),
    queryKey: productQueryKeys.list(),
  });
}
