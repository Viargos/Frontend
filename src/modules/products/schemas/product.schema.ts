import { z } from 'zod';

export const productSchema = z.object({
  createdAt: z.string(),
  deletedAt: z.string().nullable().optional(),
  description: z.string(),
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  sku: z.string().min(1),
  updatedAt: z.string(),
});

export const productListSchema = z.object({
  data: z.array(productSchema),
});

export const productDetailSchema = z.object({
  data: productSchema,
});

export const createProductSchema = z.object({
  description: z.string().trim().min(1, 'Description is required'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  price: z.number().nonnegative('Price must be zero or more'),
  sku: z.string().trim().min(2, 'SKU must be at least 2 characters'),
});

export const updateProductSchema = createProductSchema.partial().refine(
  payload => Object.keys(payload).length > 0,
  {
    message: 'At least one field is required for update',
  },
);

export const productIdSchema = z.string().min(1, 'Product id is required');

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
