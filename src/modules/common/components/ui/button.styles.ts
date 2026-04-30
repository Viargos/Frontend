import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-blue text-white hover:opacity-90',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100',
        ghost: 'text-gray-700 hover:bg-gray-100',
        destructive: 'bg-red-600 text-white hover:bg-red-500',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-9 px-4',
        lg: 'h-10 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);
