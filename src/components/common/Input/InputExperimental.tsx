import React from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const containerVaraint = cva(['relative', 'w-full', 'min-w-[200px]'], {
  variants: {
    size: {
      md: ['h-11'],
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const iconVaraint = cva(['absolute'], {
  variants: {
    variant: {
      standard: ['top-2/4', 'right-2', '-translate-y-1/2'],
    },
    size: {
      md: ['w-5', 'h-5'],
    },
  },
  defaultVariants: {
    variant: 'standard',
    size: 'md',
  },
})

const inputVariant = cva(
  [
    'peer',
    'w-full',
    'h-full',
    'bg-transparent',
    'font-normal',
    'outline',
    'outline-0',
    'focus:outline-0',
  ],
  {
    variants: {
      variant: {
        standard: [
          'border-b',
          'placeholder-shown:border-blue-gray-200',
          'placeholder:text-gray-400',
        ],
      },
      size: {
        md: ['text-base', 'px-2', 'py-3'],
      },
      color: {
        black: ['text-gray-900', 'border-gray-400', 'focus:border-gray-900'],
      },
    },
    defaultVariants: {
      variant: 'standard',
      size: 'md',
      color: 'black',
    },
  },
)

const errorVariant = cva('', {
  variants: {
    size: {
      md: ['text-xs'],
    },
    error: {
      true: ['text-error'],
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

interface InputExperimentalProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariant> {
  variant?: 'standard'
  size?: 'md'
  error?: string | boolean
  color?: 'black'
  icon?: React.ReactNode
}

export const InputExperimental = React.forwardRef<HTMLInputElement, InputExperimentalProps>(
  (
    {
      variant = 'standard',
      size = 'md',
      error = false,
      color = 'black',
      icon,
      ...rest
    }: InputExperimentalProps,
    ref,
  ) => {
    return (
      <div className={cn(containerVaraint({ size }))}>
        {icon && <div className={cn(iconVaraint({ variant, size }))}>{icon}</div>}
        <input
          {...rest}
          ref={ref}
          className={cn(
            inputVariant({ variant, size, color }),

            icon && 'pr-10',
          )}
        />
        {error && <span className={cn(errorVariant({ size, error: !!error }))}>{error}</span>}
      </div>
    )
  },
)

InputExperimental.displayName = 'InputExperimental'
