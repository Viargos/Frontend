'use client';

import type { CreateProductInput } from '@/modules/products/schemas/product.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productQueryKeys } from '@/modules/products/query-keys';
import { productsService } from '@/modules/products/services/products.service';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductInput) => productsService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
  });
}
