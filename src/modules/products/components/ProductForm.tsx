'use client';

import type { CreateProductInput } from '@/modules/products/schemas/product.schema';
import type { ProductFormValues } from '@/modules/products/types/product.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createProductSchema } from '@/modules/products/schemas/product.schema';

type ProductFormProps = {
  defaultValues?: ProductFormValues;
  isSubmitting?: boolean;
  onSubmit: (values: CreateProductInput) => Promise<void> | void;
};

const INITIAL_VALUES: ProductFormValues = {
  description: '',
  name: '',
  price: 0,
  sku: '',
};

export function ProductForm(props: ProductFormProps) {
  const { defaultValues, isSubmitting = false, onSubmit } = props;
  const form = useForm<CreateProductInput>({
    defaultValues: defaultValues ?? INITIAL_VALUES,
    resolver: zodResolver(createProductSchema),
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="product-name">Name</label>
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          id="product-name"
          {...form.register('name')}
        />
        {form.formState.errors.name ? <p className="mt-1 text-xs text-red-600">{form.formState.errors.name.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="product-sku">SKU</label>
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          id="product-sku"
          {...form.register('sku')}
        />
        {form.formState.errors.sku ? <p className="mt-1 text-xs text-red-600">{form.formState.errors.sku.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="product-price">Price</label>
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          id="product-price"
          step="0.01"
          type="number"
          {...form.register('price', {
            setValueAs: value => Number(value),
          })}
        />
        {form.formState.errors.price ? <p className="mt-1 text-xs text-red-600">{form.formState.errors.price.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="product-description">Description</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          id="product-description"
          rows={3}
          {...form.register('description')}
        />
        {form.formState.errors.description ? <p className="mt-1 text-xs text-red-600">{form.formState.errors.description.message}</p> : null}
      </div>

      <button
        className="rounded-md bg-[#160E53] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Saving...' : 'Save Product'}
      </button>
    </form>
  );
}
