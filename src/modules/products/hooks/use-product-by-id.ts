'use client';

import { useQuery } from '@tanstack/react-query';
import { productQueryKeys } from '@/modules/products/query-keys';
import { productsService } from '@/modules/products/services/products.service';

export function useProductById(productId: string) {
  return useQuery({
    enabled: Boolean(productId),
    queryFn: () => productsService.getById(productId),
    queryKey: productQueryKeys.detail(productId),
  });
}
