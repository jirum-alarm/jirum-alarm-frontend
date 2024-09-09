import { VariantProps } from 'class-variance-authority';
import React from 'react';

import { toastVariant } from './variant/toast';

import { cn } from '@/lib/cn';

interface ToastProps extends React.ComponentProps<'div'>, VariantProps<typeof toastVariant> {
  variant?: 'default';
  show?: boolean;
  children?: React.ReactNode;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ variant = 'default', show, className, children, ...rest }, ref) => {
    return (
      show && (
        <div {...rest} ref={ref} className={cn(toastVariant({ variant }), className)}>
          {children}
        </div>
      )
    );
  },
);

Toast.displayName = 'Toast';
