import { type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

import { cn } from '@shared/lib/cn';

import { buttonVaraint } from './variant/button';

interface ButtonProps
  extends Omit<React.ComponentProps<'button'>, 'color'>,
    VariantProps<typeof buttonVaraint> {
  children?: React.ReactNode;
}

export const Button = ({
  size,
  variant,
  color,
  className,
  children,
  ref,
  ...rest
}: ButtonProps) => {
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
};

Button.displayName = 'Button';
