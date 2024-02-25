import React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import {
  inputVariant,
  containerVaraint,
  iconVaraint,
  errorVariant,
  helperVariant,
} from './variant/input';

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

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
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
        <div className={containerVaraint({ size })}>
          {icon && <div className={iconVaraint({ variant, size })}>{icon}</div>}
          <input
            {...rest}
            ref={ref}
            className={cn(inputVariant({ variant, size, color }), icon && 'pr-10')}
          />
        </div>
        {helperText && <div className={helperVariant({ size, error })}>{helperText}</div>}
      </div>
    );
  },
);

Input.displayName = 'Input';
