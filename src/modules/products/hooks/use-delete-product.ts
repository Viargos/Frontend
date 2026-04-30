'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productQueryKeys } from '@/modules/products/query-keys';
import { productsService } from '@/modules/products/services/products.service';

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productsService.delete(productId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
  });
}
