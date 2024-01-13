import { cva } from 'class-variance-authority';

export const buttonVaraint = cva('w-full', {
  variants: {
    size: {
      md: ['h-12 px-3 rounded-[8px] text-base'],
    },
    variant: {
      outlined: ['border'],
      filled: ['border-none'],
    },
    color: {
      green: '',
    },
  },
  compoundVariants: [
    {
      variant: 'outlined',
      color: 'green',
      class:
        'font-normal border-primary-500 bg-transparent text-gray-900 disabled:border-none disabled:bg-gray-50 disabled:text-gray-600',
    },
    {
      variant: 'filled',
      color: 'green',
      class: 'font-semibold bg-primary-500 text-gray-900 disabled:bg-gray-300 disabled:text-white',
    },
  ],
  defaultVariants: {
    size: 'md',
    variant: 'filled',
    color: 'green',
  },
});
