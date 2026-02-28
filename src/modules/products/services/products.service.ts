import type { CreateProductInput, UpdateProductInput } from '@/modules/products/schemas/product.schema';
import type { Product, ProductDetailResponse, ProductListResponse } from '@/modules/products/types/product.types';
import { httpClient } from '@/lib/api/http-client';
import {
  createProductSchema,
  productDetailSchema,
  productIdSchema,
  productListSchema,
  updateProductSchema,
} from '@/modules/products/schemas/product.schema';

export const productsService = {
  async create(input: CreateProductInput): Promise<Product> {
    const payload = createProductSchema.parse(input);
    const response = await httpClient.post<ProductDetailResponse>('/products', JSON.stringify(payload));
    return productDetailSchema.parse(response).data;
  },

  async delete(productId: string): Promise<void> {
    const parsedId = productIdSchema.parse(productId);
    await httpClient.patch(`/products/${parsedId}`, JSON.stringify({ deletedAt: new Date().toISOString() }));
  },

  async getById(productId: string): Promise<Product> {
    const parsedId = productIdSchema.parse(productId);
    const response = await httpClient.get<ProductDetailResponse>(`/products/${parsedId}`);
    return productDetailSchema.parse(response).data;
  },

  async list(): Promise<Product[]> {
    const response = await httpClient.get<ProductListResponse>('/products');
    return productListSchema.parse(response).data;
  },

  async update(productId: string, input: UpdateProductInput): Promise<Product> {
    const parsedId = productIdSchema.parse(productId);
    const payload = updateProductSchema.parse(input);
    const response = await httpClient.patch<ProductDetailResponse>(`/products/${parsedId}`, JSON.stringify(payload));
    return productDetailSchema.parse(response).data;
  },
};
