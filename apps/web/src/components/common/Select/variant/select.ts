import { cva } from 'class-variance-authority';

export const selectButtonVaraint = cva(['w-full', 'min-w-[220px]', 'flex', 'justify-between'], {
  variants: {
    size: {
      md: ['px-2', 'py-3', 'text-base'],
    },
    color: {
      black: '',
    },
    variant: { outlined: ['border-b'] },
  },
  compoundVariants: [
    { variant: 'outlined', color: 'black', class: 'border-b-gray-900 text-gray-900' },
  ],
  defaultVariants: {
    color: 'black',
    size: 'md',
    variant: 'outlined',
  },
});

export const selectListContainerVariant = cva(
  ['z-[999]', 'absolute', 'w-full', 'bg-white', 'shadow-small'],
  {
    variants: {
      size: {
        md: ['max-h-[288px]', 'overflow-y-scroll'],
      },
      expanded: {
        true: ['animate-fade-in'],
        false: ['animate-fade-out'],
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);
