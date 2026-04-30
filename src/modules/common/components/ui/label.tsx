import { cn } from './cn';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = (props: LabelProps) => {
  const { className, ...rest } = props;
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label className={cn('text-sm font-medium text-gray-700', className)} {...rest} />
  );
};
