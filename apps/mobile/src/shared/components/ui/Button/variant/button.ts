import {cva} from 'class-variance-authority';

export const buttonVaraint = cva('w-full items-center justify-center', {
  variants: {
    size: {
      lg: ['h-[48px] px-3 rounded-[8px]'],
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
    pressed: {
      true: '',
      false: '',
    },
    disabled: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'outlined',
      color: 'primary',
      class:
        'border-primary-500 bg-transparent disabled:border-none disabled:bg-gray-50',
    },
    {
      variant: 'filled',
      color: 'primary',
      class: 'bg-primary-500 disabled:bg-gray-300 active:bg-primary-300',
    },
    // {
    //   variant: 'filled',
    //   color: 'primary',
    //   size: 'md',
    //   class: 'bg-gray-800 text-primary-500 w-auto px-5 py-1.5 h-auto',
    // },
    {
      variant: 'filled',
      color: 'secondary',
      class: 'bg-gray-100',
    },
    {
      variant: 'filled',
      color: 'error',
      class: 'bg-error-50',
    },
  ],
  defaultVariants: {
    size: 'lg',
    variant: 'filled',
    color: 'primary',
    disabled: false,
    pressed: false,
  },
});

export const textVariant = cva('text-[16px] font-pretendard', {
  variants: {
    variant: {
      outlined: '',
      filled: '',
    },
    color: {
      primary: 'text-gray-900',
      secondary: 'text-gray-700',
      error: 'text-error-600',
    },
    size: {
      lg: '',
      md: '',
    },
    disabled: {
      true: '',
      false: '',
    },
    pressed: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'filled',
      color: 'primary',
      class: 'font-pretendard-semibold',
    },
    {
      variant: 'outlined',
      color: 'primary',
      class: 'font-pretendard',
    },
    {
      variant: 'filled',
      color: 'secondary',
      class: 'font-pretendard-semibold',
    },
    {
      variant: 'filled',
      color: 'error',
      class: 'font-pretendard-semibold',
    },
    {
      variant: 'filled',
      color: 'secondary',
      pressed: true,
      class: 'text-gray-400',
    },
    {
      variant: 'filled',
      color: 'error',
      pressed: true,
      class: 'text-error-300',
    },
    {
      variant: 'outlined',
      color: 'primary',
      disabled: true,
      class: 'text-gray-600',
    },
    {
      variant: 'filled',
      color: 'primary',
      disabled: true,
      class: 'text-white',
    },
    {
      variant: 'filled',
      color: 'primary',
      size: 'md',
      disabled: true,
      class: 'text-primary-500',
    },
    {
      variant: 'outlined',
      color: 'primary',
      disabled: true,
      class: 'text-gray-600',
    },
    {
      variant: 'filled',
      color: 'primary',
      disabled: true,
      class: 'text-white',
    },
    {
      variant: 'filled',
      color: 'primary',
      size: 'md',
      disabled: true,
      class: 'text-primary-500',
    },
  ],
  defaultVariants: {
    size: 'lg',
    color: 'primary',
    disabled: false,
    variant: 'filled',
    pressed: false,
  },
});
