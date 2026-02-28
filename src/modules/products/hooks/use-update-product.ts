'use client';

import type { UpdateProductInput } from '@/modules/products/schemas/product.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productQueryKeys } from '@/modules/products/query-keys';
import { productsService } from '@/modules/products/services/products.service';

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, values }: { productId: string; values: UpdateProductInput }) => productsService.update(productId, values),
    onSuccess: async (product) => {
      await queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      queryClient.setQueryData(productQueryKeys.detail(product.id), product);
    },
  });
}
