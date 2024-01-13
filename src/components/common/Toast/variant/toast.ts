import { cva } from 'class-variance-authority';

export const toastLayoutVariant = cva('', {
  variants: {
    variant: {
      default: 'fixed top-0 left-0 pb-8 z-50',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const toastVariant = cva('', {
  variants: {
    variant: {
      default:
        'fixed grid justify-center h-min rounded-3xl bg-gray-500 text-white py-[10px] w-60 bottom-8 left-1/2 -translate-x-1/2 px-3',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
