import { type VariantProps } from 'class-variance-authority';
import React from 'react';

import { inputVariant, containerVaraint, iconVaraint, helperVariant } from './variant/input';

import { cn } from '@/lib/cn';

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
            className={cn(inputVariant({ variant, size, color }), { 'pr-10': icon })}
          />
        </div>
        {helperText && <div className={helperVariant({ size, error })}>{helperText}</div>}
      </div>
    );
  },
);

Input.displayName = 'Input';
