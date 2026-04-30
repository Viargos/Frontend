import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { cn } from './cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-blue-200 bg-blue-50 text-blue-700',
        muted: 'border-gray-200 bg-gray-100 text-gray-600',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BadgeProps = {
  variant?: VariantProps<typeof badgeVariants>['variant'];
} & React.HTMLAttributes<HTMLSpanElement>;

export const Badge = (props: BadgeProps) => {
  const { className, variant, ...rest } = props;
  return <span className={cn(badgeVariants({ variant }), className)} {...rest} />;
};
