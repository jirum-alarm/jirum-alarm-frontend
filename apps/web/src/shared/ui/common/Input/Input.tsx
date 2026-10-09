import { type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

import { cn } from '@/shared/lib/cn';

import { containerVariant, helperVariant, iconVariant, inputVariant } from './variant/input';

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariant> {
  variant?: 'standard';
  size?: 'md';
  helperText?: string | React.ReactNode;
  error?: boolean;
  color?: 'black';
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'standard',
      size = 'md',
      helperText,
      error = false,
      color = 'black',
      icon,
      ...rest
    }: InputProps,
    ref,
  ) => {
    return (
      <div>
        <div className={containerVariant({ size })}>
          {icon && <div className={iconVariant({ variant, size })}>{icon}</div>}
          <input
            {...rest}
            ref={ref}
            className={cn(inputVariant({ variant, size, color }), {
              'pr-10': icon,
            })}
          />
        </div>
        {helperText && <div className={helperVariant({ size, error })}>{helperText}</div>}
      </div>
    );
  },
);

Input.displayName = 'Input';
