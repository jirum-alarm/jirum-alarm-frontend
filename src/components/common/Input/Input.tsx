import React from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import { inputVariant, containerVaraint, iconVaraint, errorVariant } from './variant/input'

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariant> {
  variant?: 'standard'
  size?: 'md'
  error?: string | boolean
  color?: 'black'
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'standard',
      size = 'md',
      error = false,
      color = 'black',
      icon,
      ...rest
    }: InputProps,
    ref,
  ) => {
    return (
      <div className={containerVaraint({ size })}>
        {icon && <div className={iconVaraint({ variant, size })}>{icon}</div>}
        <input
          {...rest}
          ref={ref}
          className={cn(inputVariant({ variant, size, color }), icon && 'pr-10')}
        />
        {error && <span className={errorVariant({ size, error: !!error })}>{error}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'
