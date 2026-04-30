import type { VariantProps } from 'class-variance-authority';
import { buttonVariants } from './button.styles';
import { cn } from './cn';

export type ButtonProps = {
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = (props: ButtonProps) => {
  const { className, variant, size, type, ...rest } = props;
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      type={type ?? 'button'}
      {...rest}
    />
  );
};
