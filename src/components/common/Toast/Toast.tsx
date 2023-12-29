import React from 'react'
import { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import { toastVariant } from './variant/toast'

interface ToastProps
  extends Omit<React.ComponentProps<'div'>, 'color'>,
    VariantProps<typeof toastVariant> {
  variant?: 'default'
  children?: React.ReactNode
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ variant = 'default', className, children, ...rest }, ref) => {
    return (
      <div {...rest} className={cn(toastVariant({ variant }), className)}>
        {children}
      </div>
    )
  },
)

Toast.displayName = 'Toast'
