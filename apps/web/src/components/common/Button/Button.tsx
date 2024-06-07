import { type VariantProps } from 'class-variance-authority';
import { buttonVaraint } from './variant/button';
import React from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps
  extends Omit<React.ComponentProps<'button'>, 'color'>,
    VariantProps<typeof buttonVaraint> {
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ size, variant, color, className, children, ...rest }, ref) => {
    return (
      <button
        {...rest}
        ref={ref}
        type={rest.type ?? 'button'}
        className={cn(buttonVaraint({ size, variant, color }), className)}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
