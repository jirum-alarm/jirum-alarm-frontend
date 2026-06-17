import { cva } from 'class-variance-authority';

export const buttonVaraint = cva('w-full', {
  variants: {
    size: {
      lg: ['h-12 px-3 rounded-[8px] text-base'],
      md: ['rounded-[8px]'],
      sm: ['rounded-[8px]'],
    },
    variant: {
      outlined: ['border'],
      filled: ['border-none'],
    },
    color: {
      primary: '',
      secondary: '',
      error: '',
    },
  },
  compoundVariants: [
    {
      variant: 'outlined',
      color: 'primary',
      class:
        'font-normal border-border-brand bg-transparent text-fg-primary disabled:border-none disabled:bg-surface-subtle disabled:text-fg-muted',
    },
    {
      variant: 'filled',
      color: 'primary',
      class:
        'font-semibold bg-surface-brand text-fg-primary disabled:bg-surface-disabled disabled:text-fg-inverse',
    },
    {
      variant: 'filled',
      color: 'primary',
      size: 'md',
      class: 'font-semibold bg-surface-inverse-strong text-primary-500 w-auto px-5 py-1.5 h-auto',
    },
    {
      variant: 'filled',
      color: 'primary',
      size: 'sm',
      class: 'font-semibold bg-surface-inverse-strong text-primary-500 w-auto px-3 py-1 h-auto',
    },
    {
      variant: 'filled',
      color: 'secondary',
      class: 'font-semibold bg-surface-muted text-fg-secondary-strong active:text-fg-tertiary',
    },
    {
      variant: 'filled',
      color: 'error',
      class: 'font-semibold bg-surface-error text-fg-error-strong',
    },
  ],
  defaultVariants: {
    size: 'lg',
    variant: 'filled',
    color: 'primary',
  },
});
