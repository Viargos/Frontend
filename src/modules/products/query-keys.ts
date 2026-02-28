export const productQueryKeys = {
  all: ['products'] as const,
  detail: (id: string) => ['products', 'detail', id] as const,
  list: () => ['products', 'list'] as const,
};
