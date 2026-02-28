'use client';

import type { Product } from '@/modules/products/types/product.types';
import { Skeleton } from '@/modules/common';

type ProductListViewProps = {
  isLoading: boolean;
  onDelete: (product: Product) => void;
  onEdit: (product: Product) => void;
  products: Product[];
};

export function ProductListView(props: ProductListViewProps) {
  const { isLoading, onDelete, onEdit, products } = props;

  if (isLoading) {
    return (
      <div aria-busy="true" className="rounded-md border border-gray-200 bg-white p-6" role="status">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="grid grid-cols-4 gap-3" key={`product-loading-row-${index + 1}`}>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) {
    return <div className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">No products found.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">SKU</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">Price</th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map(product => (
            <tr key={product.id}>
              <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{product.sku}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{product.price.toFixed(2)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700" onClick={() => onEdit(product)} type="button">Edit</button>
                  <button className="rounded border border-red-200 px-2 py-1 text-xs text-red-600" onClick={() => onDelete(product)} type="button">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
