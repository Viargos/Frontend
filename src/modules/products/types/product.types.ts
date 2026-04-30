export type Product = {
  createdAt: string;
  deletedAt?: string | null;
  description: string;
  id: string;
  name: string;
  price: number;
  sku: string;
  updatedAt: string;
};

export type ProductFormValues = {
  description: string;
  name: string;
  price: number;
  sku: string;
};

export type ProductListResponse = {
  data: Product[];
};

export type ProductDetailResponse = {
  data: Product;
};
