import { cva } from 'class-variance-authority';

export const buttonVaraint = cva('w-full', {
  variants: {
    size: {
      lg: ['h-12 px-3 rounded-[8px] text-base'],
      md: ['rounded-[8px]'],
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
        'font-normal border-primary-500 bg-transparent text-gray-900 disabled:border-none disabled:bg-gray-50 disabled:text-gray-600',
    },
    {
      variant: 'filled',
      color: 'primary',
      class: 'font-semibold bg-primary-500 text-gray-900 disabled:bg-gray-300 disabled:text-white',
    },
    {
      variant: 'filled',
      color: 'primary',
      size: 'md',
      class: 'font-semibold bg-gray-800 text-primary-500 w-auto px-5 py-1.5 h-auto',
    },
    {
      variant: 'filled',
      color: 'secondary',
      class: 'font-semibold bg-gray-100 text-gray-700',
    },
    {
      variant: 'filled',
      color: 'error',
      class: 'font-semibold bg-error-50 text-error-600',
    },
  ],
  defaultVariants: {
    size: 'lg',
    variant: 'filled',
    color: 'primary',
  },
});
