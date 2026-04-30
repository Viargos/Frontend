import { cn } from './cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = (props: InputProps) => {
  const { className, ...rest } = props;

  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    />
  );
};
