import { cn } from './cn';

type SkeletonProps = {
  className?: string;
};

export function Skeleton(props: SkeletonProps) {
  const { className } = props;

  return (
    <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-gray-200', className)} />
  );
}
