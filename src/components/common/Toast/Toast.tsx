import React from 'react';
import { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { toastLayoutVariant, toastVariant } from './variant/toast';

interface ToastProps extends React.ComponentProps<'div'>, VariantProps<typeof toastVariant> {
  variant?: 'default';
  show?: boolean;
  children?: React.ReactNode;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ variant = 'default', show, className, children, ...rest }, ref) => {
    return (
      show && (
        <div className={cn(toastLayoutVariant({ variant }))}>
          <div {...rest} ref={ref} className={cn(toastVariant({ variant }), className)}>
            {children}
          </div>
        </div>
      )
    );
  },
);

Toast.displayName = 'Toast';
