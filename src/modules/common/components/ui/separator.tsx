import { cn } from './cn';

export type SeparatorProps = React.HTMLAttributes<HTMLDivElement>;

export const Separator = (props: SeparatorProps) => {
  const { className, ...rest } = props;
  return <div className={cn('h-px w-full bg-gray-200', className)} {...rest} />;
};
