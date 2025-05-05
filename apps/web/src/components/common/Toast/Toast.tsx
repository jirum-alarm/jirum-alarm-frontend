import { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

import { cn } from '@/lib/cn';

import { toastVariant } from './variant/toast';

interface ToastProps extends React.ComponentProps<'div'>, VariantProps<typeof toastVariant> {
  variant?: 'default';
  show?: boolean;
  children?: React.ReactNode;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
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
