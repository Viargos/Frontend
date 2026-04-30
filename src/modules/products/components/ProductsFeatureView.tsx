'use client';

import type { Product } from '@/modules/products/types/product.types';
import { useMemo, useState } from 'react';
import { ProductDeleteDialog } from '@/modules/products/components/ProductDeleteDialog';
import { ProductForm } from '@/modules/products/components/ProductForm';
import { ProductListView } from '@/modules/products/components/ProductListView';
import { useCreateProduct, useDeleteProduct, useProductsList, useUpdateProduct } from '@/modules/products/hooks';

export function ProductsFeatureView() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const productsQuery = useProductsList();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

  return (
    <div className="space-y-6 p-4 sm:p-6" data-feature="products">
      <section className="rounded-md border border-gray-200 bg-white p-4 sm:p-6">
        <h1 className="text-xl font-semibold text-gray-900">Products</h1>
        <p className="mt-1 text-sm text-gray-600">Manage products with typed hooks and service boundaries.</p>
      </section>

      <section className="rounded-md border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">{editingProduct ? 'Edit Product' : 'Create Product'}</h2>
        <ProductForm
          defaultValues={editingProduct ?? undefined}
          isSubmitting={isSubmitting}
          onSubmit={async (values) => {
            if (editingProduct) {
              await updateMutation.mutateAsync({ productId: editingProduct.id, values });
              setEditingProduct(null);
              return;
            }

            await createMutation.mutateAsync(values);
          }}
        />
      </section>

      <section>
        <ProductListView
          isLoading={productsQuery.isLoading}
          onDelete={setDeletingProduct}
          onEdit={setEditingProduct}
          products={products}
        />
      </section>

      <ProductDeleteDialog
        isOpen={Boolean(deletingProduct)}
        isSubmitting={deleteMutation.isPending}
        onCancel={() => setDeletingProduct(null)}
        onConfirm={async () => {
          if (!deletingProduct) {
            return;
          }

          await deleteMutation.mutateAsync(deletingProduct.id);
          setDeletingProduct(null);
        }}
        productName={deletingProduct?.name ?? ''}
      />
    </div>
  );
}
